export class ExtractionRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ExtractionRequestError";
    this.status = status;
  }
}
