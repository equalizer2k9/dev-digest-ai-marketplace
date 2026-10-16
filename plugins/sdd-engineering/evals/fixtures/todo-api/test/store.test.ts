import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTodo, completeTodo, listTodos } from '../src/store.ts';

test('adds, lists and completes a todo', () => {
  const todo = addTodo('write spec');
  assert.equal(listTodos().length, 1);
  assert.equal(completeTodo(todo.id)?.done, true);
});
