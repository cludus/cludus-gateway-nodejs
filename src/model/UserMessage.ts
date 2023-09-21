import { UserMessageType } from "./types";

export class UserMessage {
  action?: UserMessageType;
  recipient?: string;
  content?: string;

  validate(): string | null {
    if (!this.action) {
      return 'Invalid action.';
    }
    if (!this.recipient) {
      return 'Invalid recipient.';
    }
    if (!this.content) {
      return 'Invalid content.';
    }
    return null;
  }

  static parse = (json: string): UserMessage => {
    const jsonObject = JSON.parse(json);
    const userMessage = new UserMessage();
    Object.assign(userMessage, jsonObject);
    return userMessage;
  };
}
