export function setOptionImmutably<T>(options: T, path: string, value: unknown): T {
  const parts = path.split('.').filter(Boolean);
  const root: Record<string, unknown> = { ...(options as object) };
  let cursor = root;

  for (let index = 0; index < parts.length - 1; index++) {
    const key = parts[index];
    const current = cursor[key];
    const next =
      current == null ? {} : Array.isArray(current) ? [...current] : { ...(current as Record<string, unknown>) };
    cursor[key] = next;
    cursor = next as Record<string, unknown>;
  }

  cursor[parts[parts.length - 1]] = value;
  return root as T;
}
