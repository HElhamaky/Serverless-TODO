import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { update } from '../../businessLogic/todos-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTodoHandler');

const updateHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent,): Promise<APIGatewayProxyResult> => {
    logger.info('Update a todo', event);

    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];

    await update(todoId, updatedTodo, jwtToken);

    return {
        statusCode: 204,
        body: 'updated successfully',
    };
};

export const handler = middy(updateHandler).use(cors({ credentials: true }),);