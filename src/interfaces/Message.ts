import ErrorType from "../ErrorType";
import MessageType from "../MessageType";

export default interface Message {
	to?: string;
	from?: string;
	type: MessageType;
	code?: ErrorType;
	data?: unknown;
}
