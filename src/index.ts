// Main entry point
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function add(a: number, b: number): number {
  return a + b;
}

// Example of importing and re-exporting
export { multiply } from './utils/math';

// Default export
export default {
  greet,
  add,
};

