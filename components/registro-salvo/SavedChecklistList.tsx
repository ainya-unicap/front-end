import { ChecklistItem } from "@/components/registro/ChecklistItem";

type SavedChecklistItem = {
  id: string;
  checked: boolean;
  template?: {
    id: string;
    field_name: string;
    unit: string;
  };
};

type SavedChecklistListProps = {
  items: SavedChecklistItem[];
};

export function SavedChecklistList({ items }: SavedChecklistListProps) {
  return (
    <>
      {items.map((item) => (
        <ChecklistItem
          key={item.id}
          label={item.template?.field_name || "Item do checklist"}
          checked={item.checked}
          onPress={() => {}}
        />
      ))}
    </>
  );
}