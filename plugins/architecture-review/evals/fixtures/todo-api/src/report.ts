import { todos } from './store.ts';

export function openCount(): number {
  return todos.filter((t) => !t.done).length;
}
