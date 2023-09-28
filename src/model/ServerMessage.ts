import { ServerMessageType } from './types';

export class ServerMessage {
  readonly action: ServerMessageType;
  readonly messageId: string;
  sender?: string;
  content?: string;
  errorMsg?: string;

  constructor(action: ServerMessageType, messageId: string) {
    this.action = action;
    this.messageId = messageId;
  }

  static ack = (messageId: string): ServerMessage => {
    return new ServerMessage(ServerMessageType.ACK, messageId);
  };

  static error = (messageId: string, errorMsg: string): ServerMessage => {
    const serverMessage = new ServerMessage(ServerMessageType.ERROR, messageId);
    serverMessage.errorMsg = errorMsg;
    return serverMessage;
  };

  static message = (messageId: string, sender: string, content: string): ServerMessage => {
    const serverMessage = new ServerMessage(ServerMessageType.MESSAGE, messageId);
    serverMessage.sender = sender;
    serverMessage.content = content;
    return serverMessage;
  };

  toString(): string {
    return JSON.stringify({
      messageId: this.messageId,
      action: this.action.toString(),
      sender: this.sender,
      content: this.content,
      errorMsg: this.errorMsg,
    }, (_, value) => {
      return !!value ? value : undefined;
    });
  }
}
