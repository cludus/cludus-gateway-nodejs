import { describe, expect, test } from 'bun:test';
import { ServerMessage } from '../../src/model/ServerMessage.ts';
import { ServerMessageType } from '../../src/model/types.ts';

describe('ServerMessage tests', () => {
  test('acknowledge should indicate action', () => {
    const msg = ServerMessage.ack();
    expect(msg.action).toEqual(ServerMessageType.ACK);
  });

  test('message should indicate action, sender and content', () => {
    const sender = 'sender';
    const content = 'content';
    const msg = ServerMessage.message(sender, content);
    expect(msg.action).toEqual(ServerMessageType.MESSAGE);
    expect(msg.sender).toEqual(sender);
    expect(msg.content).toEqual(content);
  });

  test('error should indicate action and message', () => {
    const content = 'content';
    const msg = ServerMessage.error(content);
    expect(msg.action).toEqual(ServerMessageType.ERROR);
    expect(msg.errorMsg).toEqual(content);
  });

  test('toString should return json string', () => {
    const content = 'content';
    const msg = ServerMessage.error(content);
    const msgJson = msg.toString();
    expect(msgJson).toBeString();
    expect(msgJson.indexOf(`"${content}"`)).toBePositive();
    expect(msgJson.indexOf(`"action"`)).toBePositive();
    expect(msgJson.indexOf(`"sender"`)).toBeNegative();
  });
});
