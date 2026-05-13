import { useState, useCallback } from "react";
import { Alert } from "react-native";

interface UseSelectionModeReturn {
  isSelectionMode: boolean;
  selectedItems: Set<string>;
  handleLongPress: (id: string) => void;
  handleItemPress: (id: string, nonSelectionAction: () => void) => void;
  handleCancelSelection: () => void;
  handleDelete: (deleteAction: (ids: Set<string>) => void | Promise<void>, entityName: string) => void;
}

export function useSelectionMode(): UseSelectionModeReturn {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedItems.size > 0;

  const handleLongPress = useCallback((id: string) => {
    setSelectedItems(new Set([id]));
  }, []);

  const handleItemPress = useCallback(
    (id: string, nonSelectionAction: () => void) => {
      setSelectedItems((prev) => {
        if (prev.size > 0) {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return newSet;
        }
        nonSelectionAction();
        return prev;
      });
    },
    []
  );

  const handleCancelSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const handleDelete = useCallback(
    (deleteAction: (ids: Set<string>) => void | Promise<void>, entityName: string) => {
      Alert.alert(
        `Delete ${entityName}`,
        `Are you sure you want to delete ${selectedItems.size} ${entityName.toLowerCase()}${selectedItems.size > 1 ? "s" : ""}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteAction(selectedItems);
                setSelectedItems(new Set());
              } catch (error) {
                console.error("Error deleting items:", error);
                Alert.alert("Error", "Failed to delete items. Please try again.");
              }
            },
          },
        ]
      );
    },
    [selectedItems]
  );

  return {
    isSelectionMode,
    selectedItems,
    handleLongPress,
    handleItemPress,
    handleCancelSelection,
    handleDelete,
  };
}
