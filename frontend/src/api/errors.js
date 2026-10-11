export class ApiError extends Error {
  constructor(kind, message, { status = null, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; // network | timeout | unauthorized | forbidden | not_found | validation | server | invalid_response | http
    this.status = status;
    this.details = details;
  }
}
