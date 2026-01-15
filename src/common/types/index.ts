// Common type definitions

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    skip: number;
    take: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}


