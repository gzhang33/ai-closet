import { Platform } from "react-native";

export type BackgroundRemovalProvider = "rembg" | "fal";

const normalizeEnvValue = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeProvider = (value?: string): BackgroundRemovalProvider | undefined => {
  if (value === "rembg" || value === "fal") {
    return value;
  }

  return undefined;
};

export const backgroundRemovalProvider: BackgroundRemovalProvider =
  normalizeProvider(normalizeEnvValue(process.env.EXPO_PUBLIC_BACKGROUND_REMOVAL_PROVIDER)) ?? "rembg";

export const getBackgroundRemovalFalApiKey = (): string | undefined =>
  normalizeEnvValue(process.env.EXPO_PUBLIC_FAL_KEY);

export const getRembgBaseUrl = (): string => {
  const configuredUrl = normalizeEnvValue(process.env.EXPO_PUBLIC_REMBG_BASE_URL);
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const defaultUrl = Platform.OS === "android" ? "http://10.0.2.2:7001" : "http://127.0.0.1:7001";
  console.warn(
    `[rembg] EXPO_PUBLIC_REMBG_BASE_URL is not set, using default: ${defaultUrl}. ` +
      `This only works on emulators/simulators. For physical devices, set it to the LAN IP (e.g., http://192.168.1.100:7001).`
  );
  return defaultUrl;
};

export const getRembgRemoveEndpoint = (): string => `${getRembgBaseUrl()}/api/remove`;
