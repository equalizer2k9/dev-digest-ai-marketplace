import en from './en.json';

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<typeof en>;

/** Looks up a UI string by its dot path and fills `{name}` placeholders. */
export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  const template = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], en) as string;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}
