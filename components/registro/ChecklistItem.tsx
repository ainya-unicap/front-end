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
      className="flex-row items-center border-b border-slate-100 py-3 active:opacity-80"
    >
      <View
        className={`mr-3 h-7 w-7 items-center justify-center rounded-md border ${
          checked
            ? "border-emerald-700 bg-emerald-700"
            : "border-slate-300 bg-white"
        }`}
      >
        {checked && <Text className="text-base font-bold text-white">✓</Text>}
      </View>

      <Text className="flex-1 text-base text-slate-700">{label}</Text>
    </Pressable>
  );
}