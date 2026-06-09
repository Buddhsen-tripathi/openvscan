let counter = 0;

export function v4(): string {
  counter++;
  return `mock-uuid-${counter}`;
}

export default { v4 };
