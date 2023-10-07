import { ServerMessage } from "../../src/model/ServerMessage";
import { ServerMessageType } from "../../src/model/types";


describe('ServerMessage tests', () => {
  test('acknowledge should indicate action', () => {
    const messageId = 'test';
    const msg = ServerMessage.ack(messageId);
    expect(msg.messageId).toEqual(messageId);
    expect(msg.action).toEqual(ServerMessageType.ACK);
  });

  test('message should indicate action, sender and content', () => {
    const messageId = 'test';
    const sender = 'sender';
    const content = 'content';
    const msg = ServerMessage.message(messageId, sender, content);
    expect(msg.messageId).toEqual(messageId);
    expect(msg.action).toEqual(ServerMessageType.MESSAGE);
    expect(msg.sender).toEqual(sender);
    expect(msg.content).toEqual(content);
  });

  test('error should indicate action and message', () => {
    const messageId = 'test';
    const content = 'content';
    const msg = ServerMessage.error(messageId, content);
    expect(msg.messageId).toEqual(messageId);
    expect(msg.action).toEqual(ServerMessageType.ERROR);
    expect(msg.errorMsg).toEqual(content);
  });

  test('toString should return json string', () => {
    const messageId = 'test';
    const content = 'content';
    const msg = ServerMessage.error(messageId, content);
    const msgJson = msg.toString();
    expect(msgJson.indexOf(`"${messageId}"`)).toBeGreaterThan(0);
    expect(msgJson.indexOf(`"${content}"`)).toBeGreaterThan(0);
    expect(msgJson.indexOf(`"action"`)).toBeGreaterThan(0);
    expect(msgJson.indexOf(`"sender"`)).toBeLessThan(0);
  });
});
