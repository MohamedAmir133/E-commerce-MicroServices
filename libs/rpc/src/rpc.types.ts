export type RpcErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export type RpcErrorPayload = {
  code: RpcErrorCode;
  message: string;
  details?: any;
};
