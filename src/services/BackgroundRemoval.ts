import * as FileSystem from "expo-file-system/legacy";
import {
  backgroundRemovalProvider,
  getBackgroundRemovalFalApiKey,
  getRembgBaseUrl,
  getRembgRemoveEndpoint,
} from "../config/backgroundRemoval";

const API_ENDPOINT = "https://queue.fal.run/fal-ai/birefnet/v2";

const createOutputFileUri = (): string => `${FileSystem.documentDirectory}background-removed-${Date.now()}.png`;

const getImageInfo = async (imageUri: string): Promise<{ base64: string; mimeType: string }> => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

  let mimeType: string;
  if (base64.startsWith("iVBOR")) {
    mimeType = "image/png";
  } else if (base64.startsWith("UklGR")) {
    mimeType = "image/webp";
  } else if (base64.startsWith("AAAA")) {
    mimeType = "image/heic";
  } else {
    mimeType = "image/jpeg";
  }

  return { base64, mimeType };
};

const blobToBase64 = async (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error ?? new Error("Failed to read rembg response"));
    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Unexpected rembg response format"));
        return;
      }

      const commaIndex = result.indexOf(",");
      if (commaIndex === -1) {
        reject(new Error("Failed to decode rembg response"));
        return;
      }

      resolve(result.slice(commaIndex + 1));
    };

    reader.readAsDataURL(blob);
  });

const saveRemoteImageToLocalFile = async (imageUrl: string): Promise<string> => {
  const fileUri = createOutputFileUri();
  const downloadResumable = FileSystem.createDownloadResumable(imageUrl, fileUri);
  const downloadResult = await downloadResumable.downloadAsync();

  if (downloadResult && downloadResult.status === 200) {
    return downloadResult.uri;
  }

  throw new Error("Failed to download processed image");
};

const removeBackgroundWithFal = async (imageUri: string): Promise<string> => {
  const falApiKey = getBackgroundRemovalFalApiKey();
  if (!falApiKey) {
    throw new Error("EXPO_PUBLIC_FAL_KEY is required when using the fal background removal provider");
  }

  const { base64, mimeType } = await getImageInfo(imageUri);
  const base64Uri = `data:${mimeType};base64,${base64}`;
  console.debug("[BG Removal Service] Image Read Time:", new Date().toISOString());

  const payload = {
    image_url: base64Uri,
    model: "General Use (Light)",
    operating_resolution: "1024x1024",
    output_format: "png",
    refine_foreground: true,
  };

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Key ${falApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.debug("[BG Removal Service] Request Submitted Time:", new Date().toISOString());

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error submitting background removal request:", errorText);
    throw new Error("Failed to submit background removal request");
  }

  const responseData = await response.json();
  const { status_url, response_url } = responseData;

  if (!status_url || !response_url) {
    throw new Error("Invalid response from background removal API");
  }

  let status = "";
  while (status !== "COMPLETED") {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const statusResponse = await fetch(status_url, {
      method: "GET",
      headers: {
        Authorization: `Key ${falApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error("Error checking status:", errorText);
      throw new Error("Failed to check status");
    }

    const statusData = await statusResponse.json();
    status = statusData.status;

    if (status === "FAILED" || status === "CANCELLED") {
      throw new Error(`Background removal request ${status}`);
    }
  }

  const resultResponse = await fetch(response_url, {
    method: "GET",
    headers: {
      Authorization: `Key ${falApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!resultResponse.ok) {
    const errorText = await resultResponse.text();
    console.error("Error getting result:", errorText);
    throw new Error("Failed to get result");
  }

  const resultData = await resultResponse.json();
  console.debug("[BG Removal Service] Process Complete Time:", new Date().toISOString());
  const imageUrl = resultData.image?.url;

  if (!imageUrl) {
    throw new Error("No image URL in the result");
  }

  const localFileUri = await saveRemoteImageToLocalFile(imageUrl);
  console.debug("[BG Removal Service] Download Complete Time:", new Date().toISOString());
  return localFileUri;
};

const removeBackgroundWithRembg = async (imageUri: string): Promise<string> => {
  const { base64, mimeType } = await getImageInfo(imageUri);
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: `background-removal-input-${Date.now()}.${mimeType.split("/")[1] || "jpg"}`,
    type: mimeType,
  } as unknown as Blob);

  let response: Response;
  try {
    response = await fetch(getRembgRemoveEndpoint(), {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    const originalMessage = error instanceof Error ? error.message : "Unknown network error";
    const baseUrl = getRembgBaseUrl();
    const isHttpUrl = baseUrl.startsWith("http://");

    const isLikelyCleartextBlock =
      isHttpUrl &&
      (originalMessage.includes("Network request failed") ||
        originalMessage.includes("Failed to fetch") ||
        originalMessage.includes("NetworkError") ||
        originalMessage.includes("TypeError"));

    if (isLikelyCleartextBlock) {
      throw new Error(
        `HTTP request to ${baseUrl} was blocked — cleartext HTTP may not be enabled. ` +
          `This app requires a Development Build (not Expo Go) to access local rembg. ` +
          `Run "npx expo run:android" or "npx expo run:ios" to build. ` +
          `Original error: ${originalMessage}`
      );
    }

    throw new Error(
      `Failed to reach the rembg service at ${baseUrl}. ${originalMessage}. ` +
        `Check that rembg is running and EXPO_PUBLIC_REMBG_BASE_URL (${baseUrl}) is correct.`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error submitting rembg background removal request:", errorText);
    throw new Error(
      `rembg background removal failed: ${response.status} ${errorText || response.statusText}. Check that ${getRembgBaseUrl()} is reachable and the rembg service is healthy.`
    );
  }

  const base64Image = await blobToBase64(await response.blob());
  const fileUri = createOutputFileUri();
  await FileSystem.writeAsStringAsync(fileUri, base64Image, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};

export const removeBackground = async (imageUri: string): Promise<string> => {
  console.debug("[BG Removal Service] Request Initiated Time:", new Date().toISOString());

  try {
    if (backgroundRemovalProvider === "fal") {
      return await removeBackgroundWithFal(imageUri);
    }

    return await removeBackgroundWithRembg(imageUri);
  } catch (error) {
    console.error("Error in removeBackground:", error);
    throw error;
  }
};
