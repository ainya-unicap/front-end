import { Text, View } from "react-native";

type MeasurementItem = {
  id: string;
  value: number;
  template?: {
    field_name: string;
    unit: string;
  };
};

type MeasurementListProps = {
  measurements: MeasurementItem[];
};

export function MeasurementList({ measurements }: MeasurementListProps) {
  if (measurements.length === 0) {
    return (
      <Text className="text-sm text-slate-400">
        Nenhuma medição registrada ainda.
      </Text>
    );
  }

  return (
    <View>
      {measurements.map((measurement) => (
        <View
          key={measurement.id}
          className="flex-row items-center justify-between border-b border-slate-100 py-3"
        >
          <Text className="flex-1 text-base text-slate-500">
            {measurement.template?.field_name || "Medição"}
          </Text>

          <Text className="text-base font-extrabold text-emerald-950">
            {measurement.value} {measurement.template?.unit || ""}
          </Text>
        </View>
      ))}
    </View>
  );
}