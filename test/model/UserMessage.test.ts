import { describe, expect, test } from 'bun:test';
import { UserMessage } from '../../src/model/UserMessage';
import { UserMessageType } from '../../src/model/types';

describe('UserMessage tests', () => {
  test('should validate if any of id, action, recipient or content is empty', () => {
    const msg = new UserMessage();
    expect(msg.validate()).toBeDefined();

    msg.action = UserMessageType.SEND;
    expect(msg.validate()).toBeDefined();

    msg.recipient = 'Test';
    expect(msg.validate()).toBeDefined();

    msg.content = 'Test';
    expect(msg.validate()).toBeDefined();

    msg.id = 'test';
    expect(msg.validate()).toBeNull();
  });

  test('parse should throw error if json is not valid', () => {
    expect(() => UserMessage.parse('-')).toThrow();
  });

  test('parse should get json data', () => {
    const messageType = UserMessageType.SEND;
    const rawMsg = {
      id: 'test',
      action: messageType.toString(),
      recipient: 'Test',
      content: 'Test',
    };
    const msg = UserMessage.parse(JSON.stringify(rawMsg));
    expect(msg.action).toEqual(messageType);
    expect(msg.id).toEqual(rawMsg['id']);
    expect(msg.recipient).toEqual(rawMsg['recipient']);
    expect(msg.content).toEqual(rawMsg['content']);
  });
});
