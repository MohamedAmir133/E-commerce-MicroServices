import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { RpcErrorPayload } from './rpc.types';

// this filter run inside the microservice process
// our payload structure should follow the way that we want

@Catch()
export class RpcAllExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    const status = exception?.getStatus?.();
    const responseBody = exception?.getResponse?.() ?? exception?.response;

    if (status === 400) {
      const payload: RpcErrorPayload = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: responseBody,
      };

      return super.catch(new RpcException(payload), host);
    }

    const payload: RpcErrorPayload = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal error',
    };

    return super.catch(new RpcException(payload), host);
  }
}
