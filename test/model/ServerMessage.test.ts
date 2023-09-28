import { describe, expect, test } from 'bun:test';
import { ServerMessage } from '../../src/model/ServerMessage.ts';
import { ServerMessageType } from '../../src/model/types.ts';

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
    expect(msgJson).toBeString();
    expect(msgJson.indexOf(`"${messageId}"`)).toBePositive();
    expect(msgJson.indexOf(`"${content}"`)).toBePositive();
    expect(msgJson.indexOf(`"action"`)).toBePositive();
    expect(msgJson.indexOf(`"sender"`)).toBeNegative();
  });
});
