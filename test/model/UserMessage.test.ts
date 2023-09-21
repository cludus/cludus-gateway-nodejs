import { describe, expect, test } from 'bun:test';
import { UserMessage } from '../../src/model/UserMessage';
import { UserMessageType } from '../../src/model/types';

describe('UserMessage tests', () => {
  test('should validate if action or recipient or content is empty', () => {
    const msg = new UserMessage({});
    expect(msg.validate()).toBeDefined();

    msg.action = UserMessageType.SEND;
    expect(msg.validate()).toBeDefined();

    msg.recipient = 'Test';
    expect(msg.validate()).toBeDefined();

    msg.content = 'Test';
    expect(msg.validate()).toBeNull();
  });

  test('parse should throw error if json is not valid', () => {
    expect(() => UserMessage.parse('-')).toThrow();
  });

  test('parse should get json data', () => {
    const messageType = UserMessageType.SEND;
    const rawMsg = {
      action: messageType.toString(),
      recipient: 'Test',
      content: 'Test',
    };
    const msg = UserMessage.parse(JSON.stringify(rawMsg));
    expect(msg.action).toEqual(messageType);
    expect(msg.recipient).toEqual(rawMsg['recipient']);
    expect(msg.content).toEqual(rawMsg['content']);
  });

  // test('systemMessage should indicate system user', () => {
  //   const msg = UserMessage.systemMessage('Test');
  //   expect(msg.user).toEqual('system');
  // });

  // test('systemError should indicate isError and system user', () => {
  //   const msg = UserMessage.systemError('Test');
  //   expect(msg.user).toEqual('system');
  //   expect(msg.isError).toBeTruthy();
  // });

  // test('toString should return json string', () => {
  //   const msg = UserMessage.systemError('Test');
  //   const msgJson = msg.toString();
  //   expect(msgJson).toBeString();
  //   expect(msgJson.indexOf(`"${msg.user}"`)).toBePositive();
  //   expect(msgJson.indexOf(`"${msg.message}"`)).toBePositive();
  // });
});
