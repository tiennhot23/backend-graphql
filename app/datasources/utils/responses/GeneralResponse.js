class GeneralResponse {
  constructor(isSuccess = true, message = '') {
    this.isSuccess = isSuccess;
    this.message = message;
  }
}

module.exports = GeneralResponse;
