/**
 * Base error class for server errors
 * All custom errors should extend from this class
 */
export class ServerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ServerError';
  }
}
