import { createTokenizer } from "@orama/tokenizers/mandarin";

export function createCaseInsensitiveMandarinTokenizer() {
  const tokenizer = createTokenizer();
  const tokenize = tokenizer.tokenize;

  tokenizer.tokenize = (input, ...args) =>
    tokenize(
      typeof input === "string" ? input.toLowerCase() : input,
      ...args,
    );

  return tokenizer;
}
