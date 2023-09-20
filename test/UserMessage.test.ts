import { describe, expect, test } from 'bun:test';
import { UserMessage } from '../src/model/UserMessage';

describe('UserMessage tests', () => {
  test('should validate if user or message is empty', () => {
    const msg = new UserMessage({
      message: 'Test',
    });
    expect(msg.validate()).toBeDefined();

    msg.user = 'Test';
    msg.message = undefined;
    expect(msg.validate()).toBeDefined();

    msg.message = 'Test';
    expect(msg.validate()).toBeNull();
  });

  test('parse should throw error if json is not valid', () => {
    expect(() => UserMessage.parse('-')).toThrow();
  });

  test('parse should get json data', () => {
    const rawMsg = {
      user: 'Test',
      message: 'Test',
    };
    const msg = UserMessage.parse(JSON.stringify(rawMsg));
    expect(msg.user).toEqual(rawMsg['user']);
    expect(msg.message).toEqual(rawMsg['message']);
  });

  test('systemMessage should indicate system user', () => {
    const msg = UserMessage.systemMessage('Test');
    expect(msg.user).toEqual('system');
  });

  test('systemError should indicate isError and system user', () => {
    const msg = UserMessage.systemError('Test');
    expect(msg.user).toEqual('system');
    expect(msg.isError).toBeTruthy();
  });

  test('toString should return json string', () => {
    const msg = UserMessage.systemError('Test');
    const msgJson = msg.toString();
    expect(msgJson).toBeString();
    expect(msgJson.indexOf(`"${msg.user}"`)).toBePositive();
    expect(msgJson.indexOf(`"${msg.message}"`)).toBePositive();
  });
});
