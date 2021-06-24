import WebSocket from "ws";
import ErrorType from "../src/ErrorType";
import MessageType from "../src/MessageType";
import WebRTCSignalingServer from "../src/server";

let signalingServer: WebRTCSignalingServer;

beforeAll(() => {
	console.log("setup server");
	signalingServer = new WebRTCSignalingServer(8000);
});

afterAll(done => {
	console.log("close server");
	signalingServer.close();
	setTimeout(done, 500); // TODO: find another solution to close all connection before all test done
});

describe("WebRTCSignalingServer", () => {
	test("test relay", done => {
		const testSocketA: WebSocket = new WebSocket("ws://localhost:8000/test-a");
		const testSocketB: WebSocket = new WebSocket("ws://localhost:8000/test-b");
		testSocketA.on("message", message => {
			const data = JSON.parse(message.toString());

			testSocketA.close();
			testSocketB.close();

			expect(data).toMatchObject({ from: "test-b", message: "hello" });
		});

		testSocketB.on("close", () => done());

		testSocketB.on("open", () =>
			testSocketB.send(JSON.stringify({ to: "test-a", message: "hello" }))
		);
	});

	test("this id is not exist", done => {
		const testSocket: WebSocket = new WebSocket("ws://localhost:8000/test");
		testSocket.on("message", message => {
			const data = JSON.parse(message.toString());
			expect(data).toMatchObject({
				type: MessageType.ERROR,
				code: ErrorType.UNAVAILABLE_ID
			});
			testSocket.close();
		});
		testSocket.on("close", () => done());
		testSocket.on("open", () =>
			testSocket.send(
				JSON.stringify({ to: "this-id-not-exists", message: "hello" })
			)
		);
	});

	test("id is already taken", done => {
		const testSocketA: WebSocket = new WebSocket("ws://localhost:8000/test-a");
		testSocketA.on("open", () => {
			const testSocketA2: WebSocket = new WebSocket(
				"ws://localhost:8000/test-a"
			);
			testSocketA2.on("close", (code: number, reason: string) => {
				expect(code).toBe(4050);
				expect(reason).toEqual("this id is already taken");
				testSocketA.close();
			});
		});
		testSocketA.on("close", () => done());
	});
});
