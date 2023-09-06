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

  activeCount() {
    return this.#activeTokens.length;
  }

  inactiveCount() {
    return this.#inactiveTokens.length;
  }
}

export { UserHandler };
