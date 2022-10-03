export class AppError extends Error {
  message: string;
  code: number;
  constructor(message: any, code: number) {
    super(message);
    this.message = message;
    this.code = code;
  }

  jsonDetail() {
    return {
      message: this.message,
      errorCode: this.code,
      timestamp: new Date().toUTCString(),
    };
  }
}
