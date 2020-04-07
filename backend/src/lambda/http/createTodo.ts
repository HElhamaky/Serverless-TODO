import 'source-map-support/register'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createTodo } from '../../businessLogic/todos-controller';
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodoHandler');

const createHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent,): Promise<APIGatewayProxyResult> => {
  // TODO: Implement creating a new TODO item
  
  logger.info('new todo item', event);

  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const newItem = await createTodo(newTodo, jwtToken);
  return {
      statusCode: 201,
      body: JSON.stringify({
          newItem,
      }),
  };
};

export const handler = middy(createHandler).use(cors({ credentials: true }),);