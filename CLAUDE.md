# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Closet is a React Native / Expo mobile app for digital wardrobe management, outfit creation, and virtual try-on. It targets iOS and Android, runs fully client-side with local storage, and integrates with AI services for background removal, clothing categorization, and virtual try-on.

## Common Commands

```bash
npm install            # Install dependencies
npm start              # Start Expo dev server
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run in browser

# AI service setup (local)
npm run setup:ollama-host   # Configure Ollama on macOS for LAN access
npm run setup:rembg-host    # Start local rembg server on port 7001
npm run verify:ollama       # Verify Ollama connectivity
npm run verify:rembg        # Verify rembg connectivity

# Docker-based development
npm run container:up        # Start Expo in Docker with LAN access
npm run container:down      # Stop Docker containers
```

No test runner or linter is currently configured.

## Environment Variables

All env vars are Expo public vars (prefixed `EXPO_PUBLIC_`). Copy `.env.example` to `.env`:

- **Background removal provider**: `EXPO_PUBLIC_BACKGROUND_REMOVAL_PROVIDER` = `rembg` (default) or `fal`
- **Categorization provider**: `EXPO_PUBLIC_CLOTHING_CATEGORIZATION_PROVIDER` = `ollama` (default) or `openai`
- **rembg**: `EXPO_PUBLIC_REMBG_BASE_URL` (auto-detected: `127.0.0.1:7001` on iOS/web, `10.0.2.2:7001` on Android)
- **Ollama**: `EXPO_PUBLIC_OLLAMA_BASE_URL`, `EXPO_PUBLIC_OLLAMA_MODEL` (default: `qwen3-vl:4b`)
- **OpenAI**: `EXPO_PUBLIC_OPENAI_KEY`, `EXPO_PUBLIC_OPENAI_MODEL` (default: `gpt-4o`)
- **fal.ai**: `EXPO_PUBLIC_FAL_KEY`
- **Virtual try-on**: `EXPO_PUBLIC_KWAI_ACCESS_KEY`, `EXPO_PUBLIC_KWAI_SECRET_KEY` (Kwai Kolors API)

Config logic lives in `src/config/ai.ts` and `src/config/backgroundRemoval.ts`.

## Architecture

### Provider/Context pattern (state management)

Three React Contexts provide global state, all persisted to AsyncStorage:

- **ClothingContext** (`src/contexts/ClothingContext.tsx`) — CRUD for `ClothingItem[]`, filtering by category/tags, and the `addClothingItemFromImage` pipeline that runs background removal and categorization in parallel with per-step status tracking (`processingStatus.backgroundRemoval` / `processingStatus.categorization`).
- **OutfitContext** (`src/contexts/OutfitContext.tsx`) — CRUD for `Outfit[]`, tag-based filtering.
- **VirtualTryOnContext** (`src/contexts/VirtualTryOnContext.tsx`) — history of try-on results (capped at 100).

Contexts are nested in `App.tsx`: `ClothingProvider > OutfitProvider > VirtualTryOnProvider`.

### AI Service layer

Each AI capability is a standalone service in `src/services/`:

- **BackgroundRemoval.ts** — dispatches to `removeBackgroundWithRembg` or `removeBackgroundWithFal` based on config. Returns a local file URI.
- **ClothingCategorization.ts** — sends a base64 image to OpenAI or Ollama's `/v1/chat/completions` endpoint with a structured prompt. Normalizes the response against allowed categories/colors/seasons/occasions defined in `src/data/`.
- **VirtualTryOn.ts** — uses Kwai Kolors API with JWT auth (via `expo-jwt`). Creates an async task and polls until completion.

### Navigation structure

`src/navigation/index.tsx` uses React Navigation with:
- Root stack (`RootStack`) containing `MainTabs` and modal screens
- Bottom tabs: **Closet**, **Outfits**, **Try-On**, **Profile**
- Each tab has its own native stack navigator (e.g., `ClosetStack` with `ClothingManagement` → `ClothingDetail`)
- Modal routes `ClothingDetailModal` and `OutfitDetailModal` allow detail views to be presented modally from other tabs

### Data types (`src/types/`)

- **ClothingItem** — has `processingStatus` and `processingError` fields for tracking async AI processing state
- **Outfit** — contains `OutfitItem[]` with canvas transform data (x, y, scale, rotation, zIndex)
- **VirtualTryOnItem** — supports `tryOnType`: `single`, `discover`, or `outfit`

### Styling

- Colors are centralized in `src/styles/colors.ts` (warm yellow theme with `primary_yellow: #F4C753`)
- Typography uses Plus Jakarta Sans font family loaded via `@expo-google-fonts/plus-jakarta-sans`
- Font family tokens in `src/styles/globalStyles.ts`: `typography.regular`, `typography.medium`, `typography.semiBold`, `typography.bold`

### Allowed values for categorization

Defined in `src/data/`:
- **Categories/subcategories** (`categories.ts`): 7 top-level categories (Tops, Bottoms, Dresses, Footwear, Bags, Accessories, Jewelry) each with subcategories
- **Colors, seasons, occasions** (`options.ts`): fixed lists used for both AI prompt construction and response normalization
