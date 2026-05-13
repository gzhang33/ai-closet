import { useCallback } from "react";
import { Alert } from "react-native";

interface UseUnsavedChangesGuardOptions {
  isDirty: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
}

export function useUnsavedChangesGuard(options: UseUnsavedChangesGuardOptions): () => void {
  const { isDirty, onSave, onDiscard } = options;

  return useCallback(() => {
    if (isDirty) {
      Alert.alert("Unsaved Changes", "Do you want to save your changes?", [
        {
          text: "Discard",
          style: "destructive",
          onPress: onDiscard,
        },
        {
          text: "Save",
          onPress: async () => {
            try {
              await onSave();
              onDiscard();
            } catch (error) {
              console.error("Error saving changes:", error);
              Alert.alert("Error", "Failed to save changes. Your changes have not been saved.");
            }
          },
        },
      ]);
    } else {
      onDiscard();
    }
  }, [isDirty, onSave, onDiscard]);
}
