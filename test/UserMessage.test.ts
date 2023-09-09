import 'jest';
import { UserMessage } from '../src/UserMessage';

describe('UserMessage tests', () => {
  it('should validate if user or message is empty', () => {
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

  it('parse should throw error if json is not valid', () => {
    expect(() => UserMessage.parse('-')).toThrow();
  });

  it('parse should get json data', () => {
    const rawMsg = {
      user: 'Test',
      message: 'Test',
    };
    const msg = UserMessage.parse(JSON.stringify(rawMsg));
    expect(msg.user).toBe(rawMsg['user']);
    expect(msg.message).toBe(rawMsg['message']);
  });

  it('systemMessage should indicate system user', () => {
    const msg = UserMessage.systemMessage('Test');
    expect(msg.user).toBe('system');
  });

  it('systemError should indicate isError and system user', () => {
    const msg = UserMessage.systemError('Test');
    expect(msg.user).toBe('system');
    expect(msg.isError).toBeTruthy();
  });
});
