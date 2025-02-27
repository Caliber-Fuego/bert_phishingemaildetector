import vocab from "../assets/vocab.json";

export function tokenize(text: string): number[] {
  const tokens = text.toLowerCase().split(" ");
  return tokens.map((token) => (vocab as { [key: string]: number })[token] ?? 0); // Use 0 for unknown words
}

export function preprocessInput(text: string): number[][] {
  const tokenized = tokenize(text);
  return [tokenized];
}