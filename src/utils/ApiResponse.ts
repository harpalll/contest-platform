export class ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  constructor(success: boolean, data: T, error: string | null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }
}
