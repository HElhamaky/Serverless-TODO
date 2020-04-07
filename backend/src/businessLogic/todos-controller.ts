import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodoAccessModel } from '../databaseAccess/todo-Access-model';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { parseUserId } from '../auth/utils';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccessModel = new TodoAccessModel();

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);

    return todoAccessModel.all(userId);
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string,
): Promise<TodoItem> {
    const itemId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return todoAccessModel.create({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    });
}

export async function update(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccessModel.get(todoId, userId);

    todoAccessModel.update(todo.todoId, todo.userId, updateTodoRequest);
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccessModel.get(todoId, userId);

    await todoAccessModel.delete(todo.todoId, todo.userId);
}

export async function setAttachmentUrl(
    todoId: string,
    attachmentUrl: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccessModel.get(todoId, userId);

    todoAccessModel.setAttachmentUrl(todo.todoId, todo.userId, attachmentUrl);
}