import { ServerMessageType } from "./types";

export class ServerMessage {
  action: ServerMessageType;
  sender?: string;
  content?: string;
  errorMsg?: string;

  constructor(action: ServerMessageType) {
    this.action = action;
  }

  static ack = (): ServerMessage => {
    return new ServerMessage(ServerMessageType.ACK);
  };

  static error = (errorMsg: string): ServerMessage => {
    const serverMessage = new ServerMessage(ServerMessageType.ERROR);
    serverMessage.errorMsg = errorMsg;
    return serverMessage;
  };

  static message = (sender: string, content: string): ServerMessage => {
    const serverMessage = new ServerMessage(ServerMessageType.MESSAGE);
    serverMessage.sender = sender;
    serverMessage.content = content;
    return serverMessage;
  };

  toString(): string {
    return JSON.stringify({
      action: this.action.toString(),
      sender: this.sender,
      content: this.content,
      errorMsg: this.errorMsg,
    }, (_, value) => {
      return !!value ? value : undefined;
    });
  }
}
