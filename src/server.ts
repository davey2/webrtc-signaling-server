import WebSocket from "ws";
import Connection from "./interfaces/Connection";
import { IncomingMessage } from "http";
import Message from "./interfaces/Message";
import MessageType from "./MessageType";
import ErrorType from "./ErrorType";

export default class WebRTCSignalingServer {
	private connections: Connection[] = [];
	private wss: WebSocket.Server;

	constructor(port = 8000) {
		this.wss = new WebSocket.Server({ port });

		this.wss.on("listening", () =>
			console.log("Server listening", this.wss.address())
		);
		this.wss.on("connection", this.handleConnection.bind(this));
	}

	private handleConnection(socket: WebSocket, request: IncomingMessage) {
		const id: string = request.url?.substring(1) ?? "";

		if (this.checkId(id) || id.length == 0) {
			socket.close(4050, "this id is already taken");
		} else {
			console.info(id, "connected");
			const connection = this.addConnection(id, socket);
			socket.on("message", data => this.handleMessage(connection, data));
			socket.on("close", () => this.handleClose(connection));
		}
	}

	private handleClose(connection: Connection) {
		console.info(connection.id, "disconnected");
		this.removeConnection(connection);
	}

	private handleMessage(connection: Connection, message: WebSocket.Data) {
		const data: Message = JSON.parse(message.toString());

		if (data.to) {
			const anotherConnection: Connection | null = this.getConnection(data.to);
			if (anotherConnection) {
				delete data.to;
				data.from = connection.id;
				anotherConnection.socket.send(JSON.stringify(data));
			} else {
				connection.socket.send(
					JSON.stringify({
						type: MessageType.ERROR,
						code: ErrorType.UNAVAILABLE_ID
					})
				);
			}
		}
	}

	private checkId(id: string): boolean {
		const found: boolean = this.connections.some(
			connection => connection.id === id
		);
		return found;
	}

	private addConnection(id: string, socket: WebSocket): Connection {
		const connection: Connection = {
			id,
			socket
		};
		this.connections.push(connection);
		return connection;
	}

	private removeConnection(connection: Connection) {
		const index = this.connections.findIndex(item => item === connection);
		this.connections.splice(index, 1);
	}

	private getConnection(id: string): Connection | null {
		const connection: Connection | null =
			this.connections.find(connection => connection.id === id) ?? null;
		return connection;
	}

	close(): void {
		this.wss.close();
	}
}
