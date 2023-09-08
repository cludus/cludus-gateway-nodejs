class UserMessage {
  user?: string;
  message?: string;
  isError: boolean = false;

  constructor(data: Partial<UserMessage>) {
    Object.assign(this, data);
  }

  validate(): string | null {
    if (!this.user) {
      return 'Invalid user.';
    }
    if (!this.message) {
      return 'Invalid message.';
    }
    return null;
  }

  static parse = (json: string): UserMessage => {
    const jsonObject = JSON.parse(json);
    return new UserMessage(jsonObject);
  };

  static systemError = (message: string): UserMessage => {
    return new UserMessage({ user: 'system', message, isError: true });
  };
}

export { UserMessage };
