import { Pressable, ScrollView, Text } from "react-native";

type FilterChipsProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function FilterChips({ options, value, onChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4 -mx-1 px-1"
    >
      {options.map((option) => {
        const active = option === value;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            className={`mr-2 rounded-full px-4 py-2 active:opacity-80 ${
              active ? "bg-emerald-800" : "border border-slate-200 bg-white"
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                active ? "text-white" : "text-slate-500"
              }`}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
