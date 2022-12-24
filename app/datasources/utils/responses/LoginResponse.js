class LoginResponse {
  constructor(isSuccess = true, message = '', token = '', user = null) {
    this.isSuccess = isSuccess;
    this.message = message;
    this.token = token;
    this.user = user;
  }
}

module.exports = LoginResponse;
