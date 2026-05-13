import { ClothingItem } from "../types/ClothingItem";
import { categories } from "../data/categories";
import { colors as colorOptions, seasons, occasions } from "../data/options";
import * as FileSystem from "expo-file-system/legacy";
import {
  clothingCategorizationProvider,
  getCategorizationApiKey,
  getCategorizationEndpoint,
  getOllamaBaseUrl,
  ollamaModel,
  openAiModel,
} from "../config/ai";

type CategorizationResponse = Partial<
  Pick<ClothingItem, "category" | "subcategory" | "color" | "season" | "occasion">
>;

type RawCategorizationPayload = {
  category?: unknown;
  subcategory?: unknown;
  color?: unknown;
  season?: unknown;
  occasion?: unknown;
};

const categoryEntries = Object.entries(categories);
const supportedCategories = categoryEntries.map(([category]) => category);
const supportedSubcategories = categoryEntries.flatMap(([category, subcategories]) =>
  subcategories.map((subcategory) => ({
    category,
    subcategory,
  }))
);

const findCaseInsensitiveMatch = (value: string, options: string[]): string | undefined => {
  const normalizedValue = value.trim().toLowerCase();
  return options.find((option) => option.toLowerCase() === normalizedValue);
};

const normalizeText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

const extractJsonObject = (value: string): RawCategorizationPayload => {
  const jsonBlockMatch = value.match(/```json\s*([\s\S]*?)```/i) ?? value.match(/```\s*([\s\S]*?)```/i);
  const candidate = jsonBlockMatch?.[1] ?? value;
  const objectMatch = candidate.match(/\{[\s\S]*\}/);

  if (!objectMatch) {
    throw new Error("Model response did not include a JSON object");
  }

  return JSON.parse(objectMatch[0]) as RawCategorizationPayload;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeSelectableValues = (value: unknown, options: string[]): string[] => {
  const normalizedValues = toStringArray(value)
    .map((item) => findCaseInsensitiveMatch(item, options))
    .filter((item): item is string => Boolean(item));

  return Array.from(new Set(normalizedValues));
};

const resolveCategoryAndSubcategory = (rawCategory: unknown, rawSubcategory: unknown) => {
  const categoryValue = normalizeText(rawCategory);
  const subcategoryValue = normalizeText(rawSubcategory);

  const exactCategory = findCaseInsensitiveMatch(categoryValue, supportedCategories);
  const exactSubcategory = findCaseInsensitiveMatch(
    subcategoryValue,
    supportedSubcategories.map((item) => item.subcategory)
  );

  if (exactCategory) {
    const validSubcategory = supportedSubcategories.find(
      (item) => item.category === exactCategory && item.subcategory === exactSubcategory
    );

    return {
      category: exactCategory,
      subcategory: validSubcategory?.subcategory ?? "",
    };
  }

  if (categoryValue.includes("/")) {
    const [possibleCategory, ...subcategoryParts] = categoryValue.split("/");
    const matchedCategory = findCaseInsensitiveMatch(possibleCategory, supportedCategories);
    const matchedSubcategory = findCaseInsensitiveMatch(
      subcategoryParts.join("/"),
      supportedSubcategories.map((item) => item.subcategory)
    );

    if (matchedCategory && matchedSubcategory) {
      const validSubcategory = supportedSubcategories.find(
        (item) => item.category === matchedCategory && item.subcategory === matchedSubcategory
      );

      if (validSubcategory) {
        return {
          category: matchedCategory,
          subcategory: validSubcategory.subcategory,
        };
      }
    }
  }

  const inferredFromCategory = supportedSubcategories.find(
    (item) => item.subcategory.toLowerCase() === categoryValue.toLowerCase()
  );
  if (inferredFromCategory) {
    return inferredFromCategory;
  }

  const inferredFromSubcategory = supportedSubcategories.find(
    (item) => item.subcategory.toLowerCase() === subcategoryValue.toLowerCase()
  );
  if (inferredFromSubcategory) {
    return inferredFromSubcategory;
  }

  return {
    category: "",
    subcategory: "",
  };
};

const normalizeCategorizationPayload = (payload: RawCategorizationPayload): CategorizationResponse => {
  const { category, subcategory } = resolveCategoryAndSubcategory(payload.category, payload.subcategory);

  return {
    category,
    subcategory,
    color: normalizeSelectableValues(payload.color, colorOptions),
    season: normalizeSelectableValues(payload.season, seasons),
    occasion: normalizeSelectableValues(payload.occasion, occasions),
  };
};

const buildSystemPrompt = (): string => {
  const categoriesAndSubcategories = categoryEntries
    .map(([category, subcategories]) => `${category}: ${subcategories.join(", ")}`)
    .join("; ");

  return `You are an AI assistant that categorizes clothing items based on images.
The allowed categories and subcategories are: ${categoriesAndSubcategories}.
The allowed colors are: ${colorOptions.join(", ")}.
The allowed seasons are: ${seasons.join(", ")}.
The allowed occasions are: ${occasions.join(", ")}.
Return only a JSON object with the keys category, subcategory, color, season, occasion.
category and subcategory must come from the allowed lists.
color, season, and occasion must always be arrays of allowed values.
If you are unsure about a field, return an empty string for category/subcategory or an empty array for lists.`;
};

export const categorizeClothing = async (imageUri: string): Promise<CategorizationResponse> => {
  try {
    console.debug("[Categorization Service] Request Initiated Time:", new Date().toISOString());
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

    let imageMimeType: string;
    if (base64.startsWith("iVBOR")) {
      imageMimeType = "image/png";
    } else if (base64.startsWith("UklGR")) {
      imageMimeType = "image/webp";
    } else if (base64.startsWith("AAAA")) {
      imageMimeType = "image/heic";
    } else {
      imageMimeType = "image/jpeg";
    }
    const base64Uri = `data:${imageMimeType};base64,${base64}`;

    const apiKey = getCategorizationApiKey();
    if (!apiKey) {
      throw new Error("EXPO_PUBLIC_OPENAI_KEY is required when using the OpenAI categorization provider");
    }

    const requestBody: Record<string, unknown> = {
      model: clothingCategorizationProvider === "ollama" ? ollamaModel : openAiModel,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Categorize the main clothing item shown in this image.",
            },
            {
              type: "image_url",
              image_url: {
                url: base64Uri,
                detail: "low",
              },
            },
          ],
        },
      ],
      stream: false,
      temperature: 0,
    };

    if (clothingCategorizationProvider === "openai") {
      requestBody.response_format = {
        type: "json_schema",
        json_schema: {
          name: "clothing_categorization",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: { type: "string" },
              subcategory: { type: "string" },
              color: { type: "array", items: { type: "string" } },
              season: { type: "array", items: { type: "string" } },
              occasion: { type: "array", items: { type: "string" } },
            },
            required: ["category", "subcategory", "color", "season", "occasion"],
            additionalProperties: false,
          },
        },
      };
    }

    console.debug("[Categorization Service] Request Submitted Time:", new Date().toISOString());
    const response = await fetch(getCategorizationEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (clothingCategorizationProvider === "ollama") {
        throw new Error(
          `Ollama API error: ${response.status} ${errorText}. Check that ${ollamaModel} is available and ${getOllamaBaseUrl()} is reachable.`
        );
      }

      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    console.debug("[Categorization Service] Response Received Time:", new Date().toISOString());
    const aiContent = responseData.choices?.[0]?.message?.content;

    if (typeof aiContent !== "string") {
      throw new Error("Model response did not contain text content");
    }

    return normalizeCategorizationPayload(extractJsonObject(aiContent));
  } catch (error) {
    console.error("Error categorizing clothing:", error);

    if (clothingCategorizationProvider === "ollama") {
      const baseUrl = getOllamaBaseUrl();
      const message = error instanceof Error ? error.message : "Unknown Ollama error";
      throw new Error(
        `${message}. If you are using a simulator, emulator, or container, verify EXPO_PUBLIC_OLLAMA_BASE_URL points to a reachable Ollama host such as ${baseUrl}.`
      );
    }

    throw error instanceof Error ? error : new Error("Unknown categorization error");
  }
};
