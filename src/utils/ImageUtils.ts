import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";

export const ensureJpeg = async (imageUri: string): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

  if (base64.startsWith("iVBOR") || base64.startsWith("UklGR") || base64.startsWith("/9j/")) {
    return imageUri;
  }

  const result = await manipulateAsync(imageUri, [], { compress: 1, format: SaveFormat.JPEG });

  if (!result.uri) {
    throw new Error("Failed to convert image to JPEG");
  }

  return result.uri;
};
