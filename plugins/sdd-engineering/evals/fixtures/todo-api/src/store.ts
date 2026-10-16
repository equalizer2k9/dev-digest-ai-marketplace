export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export const todos: Todo[] = [];
let nextId = 1;

export function addTodo(title: string): Todo {
  const todo: Todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}

export function listTodos(): Todo[] {
  return [...todos];
}

export function completeTodo(id: number): Todo | undefined {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = true;
  return todo;
}
