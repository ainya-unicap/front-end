import { Fragment } from "react";
import { Text, View } from "react-native";

type StepperProps = {
  steps: string[];
  current: number;
};

export function Stepper({ steps, current }: StepperProps) {
  return (
    <View className="flex-row items-start">
      {steps.map((label, index) => {
        const active = index <= current;
        const isLast = index === steps.length - 1;

        return (
          <Fragment key={label}>
            <View className="items-center">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  active ? "bg-emerald-700" : "bg-slate-200"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                >
                  {index + 1}
                </Text>
              </View>

              <Text
                className={`mt-1 text-xs font-semibold ${
                  active ? "text-emerald-800" : "text-slate-400"
                }`}
              >
                {label}
              </Text>
            </View>

            {!isLast && (
              <View
                className={`mt-4 h-0.5 flex-1 ${
                  index < current ? "bg-emerald-700" : "bg-slate-200"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </View>
  );
}
