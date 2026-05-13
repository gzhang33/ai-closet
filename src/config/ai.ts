import { Platform } from "react-native";

export type ClothingCategorizationProvider = "openai" | "ollama";

const normalizeEnvValue = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeProvider = (value?: string): ClothingCategorizationProvider | undefined => {
  if (value === "openai" || value === "ollama") {
    return value;
  }

  return undefined;
};

const inferredProvider = normalizeEnvValue(process.env.EXPO_PUBLIC_OLLAMA_MODEL) ? "ollama" : "openai";

export const clothingCategorizationProvider: ClothingCategorizationProvider =
  normalizeProvider(normalizeEnvValue(process.env.EXPO_PUBLIC_CLOTHING_CATEGORIZATION_PROVIDER)) ?? inferredProvider;

export const openAiModel = normalizeEnvValue(process.env.EXPO_PUBLIC_OPENAI_MODEL) ?? "gpt-4o";

export const ollamaModel = normalizeEnvValue(process.env.EXPO_PUBLIC_OLLAMA_MODEL) ?? "qwen3-vl:4b";

export const getOllamaBaseUrl = (): string => {
  const configuredUrl = normalizeEnvValue(process.env.EXPO_PUBLIC_OLLAMA_BASE_URL);
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return Platform.OS === "android" ? "http://10.0.2.2:11434" : "http://127.0.0.1:11434";
};

export const getCategorizationEndpoint = (): string => {
  if (clothingCategorizationProvider === "ollama") {
    return `${getOllamaBaseUrl()}/v1/chat/completions`;
  }

  return "https://api.openai.com/v1/chat/completions";
};

export const getCategorizationApiKey = (): string | undefined => {
  if (clothingCategorizationProvider === "ollama") {
    return "ollama";
  }

  return normalizeEnvValue(process.env.EXPO_PUBLIC_OPENAI_KEY);
};
