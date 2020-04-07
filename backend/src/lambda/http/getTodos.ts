import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getAllTodos } from '../../businessLogic/todos-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTodosHandler');

const allHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, ): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  logger.info('Get all todos', event);

  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const items = await getAllTodos(jwtToken);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items,
    }),
  };
}
export const handler = middy(allHandler).use(cors({ credentials: true }));
