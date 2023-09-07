class UserHandler {
  #users = {};
  #activeTokens = [];
  #inactiveTokens = [];

  setSession(token, data) {
    const hasSession = !!token && !!data;
    this.#users[token] = hasSession ? data : null;
    if (!this.#activeTokens.includes(token)) {
      this.#activeTokens.push(token);
    }
    return hasSession;
  }

  removeSession(token) {
    delete this.#users[token];
    this.#activeTokens.pop(token);
    if (!this.#inactiveTokens.includes(token)) {
      this.#inactiveTokens.push(token);
    }
  }

  deliverMessage(token, socket, data) {
    try {
      const messageMap = JSON.parse(data);
      const message = messageMap['message'];
      if (!message) {
        throw new Error();
      }
      const targetToken = messageMap['user'];
      if (!!this.#users[targetToken]) {
        this.#users[targetToken].send({
          user: token,
          message,
        });
        socket.send('Message delivered.');
      } else {
        socket.send('Target user could not be found.');
      }
    } catch (e) {
      console.error('deliverMessage', e);
      socket.send('Invalid message.');
    }
  }

  activeCount() {
    return this.#activeTokens.length;
  }

  inactiveCount() {
    return this.#inactiveTokens.length;
  }
}

export { UserHandler };
