import { Pressable, Text, View } from "react-native";

type ChecklistItemProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
};

export function ChecklistItem({
  label,
  checked,
  onPress,
}: ChecklistItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-slate-200 py-4 active:opacity-80"
    >
      <View
        className={`mr-4 h-8 w-8 items-center justify-center rounded-md border ${
          checked
            ? "border-emerald-700 bg-emerald-700"
            : "border-slate-300 bg-white"
        }`}
      >
        {checked && <Text className="text-lg font-bold text-white">✓</Text>}
      </View>

      <Text className="flex-1 text-lg font-medium text-slate-800">{label}</Text>
    </Pressable>
  );
}