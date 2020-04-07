import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

function createDynamoDBClient(): DocumentClient {
  if (process.env.IS_OFFLINE) {
      return new AWS.DynamoDB.DocumentClient({
          region: 'localhost',
          endpoint: 'localstack:4569',
          sslEnabled: false,
      });
  }
  return new AWS.DynamoDB.DocumentClient();
}

export class TodoAccessModel {
  public constructor(
    private readonly documentClient: DocumentClient = createDynamoDBClient(), //new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
  ) { }

  public async all(userId: string): Promise<TodoItem[]> {
    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as TodoItem[];
  }

  public async get(todoId: string, userId: string): Promise<TodoItem> {
    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId and userId = :userId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId,
        },
      })
      .promise();

    const item = result.Items[0];
    return item as TodoItem;
  }

  public async create(todoItem: TodoItem): Promise<TodoItem> {
    await this.documentClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
      })
      .promise();

    return todoItem;
  }

  public async update(
    todoId: string,
    userId: string,
    todoUpdate: TodoUpdate,
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression:
        'set #name = :n, #dueDate = :due, #done = :d',
        ExpressionAttributeValues: {
          ':n': todoUpdate.name,
          ':due': todoUpdate.dueDate,
          ':d': todoUpdate.done,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate',
          '#done': 'done'
        },
        ReturnValues: 'UPDATED_NEW',
      }).promise();
  }

  public async setAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string,
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId,
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl,
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
  }

  public async delete(todoId: string, userId: string): Promise<void> {
    this.documentClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId,
        },
      })
      .promise();
  }
}
