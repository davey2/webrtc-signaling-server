import WebSocket from "ws";

export default interface Connection {
	id: string;
	socket: WebSocket;
}
