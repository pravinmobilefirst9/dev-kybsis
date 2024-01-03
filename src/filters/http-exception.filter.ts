import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        let responseObject: any = {}
        let message = exception.response.message

        // Check for DTO error
        if (Array.isArray(message)) {
            responseObject.message = exception.response.message[0]
        }
        else {
            responseObject.message = exception.response
        }

        responseObject = {
            success: false,
            statusCode : status,
            ...responseObject,
            data:{}
           
        }
        response
            .status(status)
            .json(responseObject);
    }
}