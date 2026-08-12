import { RpcException } from '@nestjs/microservices';
import { RpcErrorPayload } from './rpc.types';

export function rpcBadRequest(message: string, details?: any): never {
  const payload: RpcErrorPayload = { code: 'BAD_REQUEST', message, details };
  throw new RpcException(payload);
}

export function rpcNotFound(message: string, details?: any): never {
  const payload: RpcErrorPayload = { code: 'NOT_FOUND', message, details };
  throw new RpcException(payload);
}

export function rpcInternal(message = 'Internal error', details?: any): never {
  const payload: RpcErrorPayload = {
    code: 'INTERNAL_SERVER_ERROR',
    message,
    details,
  };
  throw new RpcException(payload);
}

export function rpcUnauthorized(
  message = 'Unauthorized',
  details?: any,
): never {
  const payload: RpcErrorPayload = { code: 'UNAUTHORIZED', message, details };
  throw new RpcException(payload);
}

export function rpcForbidden(message = 'Forbidden', details?: any): never {
  const payload: RpcErrorPayload = { code: 'FORBIDDEN', message, details };
  throw new RpcException(payload);
}
