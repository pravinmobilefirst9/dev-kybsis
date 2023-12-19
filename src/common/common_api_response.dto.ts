export class ApiResponse<T = any> {
    status: string;
    message?: string;
    data?: T;
  
    constructor(status: string, message?: string, data?: T) {
      this.status = status;
      this.message = message;
      this.data = data;
    }
  }