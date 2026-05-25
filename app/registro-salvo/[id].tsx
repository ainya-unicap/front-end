import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import {
  FormularioCompleto,
  getFormularioById,
  syncFormulario,
} from "@/services/api";

import { SuccessCard } from "@/components/registro-salvo/SuccessCard";
import { SummaryMetricCard } from "@/components/registro-salvo/SummaryMetricCard";
import { SavedSectionCard } from "@/components/registro-salvo/SavedSectionCard";
import { PhotoPreviewList } from "@/components/registro-salvo/PhotoPreviewList";
import { MeasurementList } from "@/components/registro-salvo/MeasurementList";
import { SavedChecklistList } from "@/components/registro-salvo/SavedChecklistList";

const mockFormulario: FormularioCompleto = {
  id: "mock-registro",
  type: "SEMANAL",
  synced: true,
  createdAt: "2026-04-07T10:30:00.000Z",
  started_at: "2026-04-07T08:00:00.000Z",
  ended_at: "2026-04-07T10:30:00.000Z",
  observations:
    "Plantas com bom desenvolvimento vegetativo. Solo úmido e sem sinais relevantes de pragas.",
  list: {
    id: "lista-1",
    plant: {
      id: "plant-1",
      name: "Capim Massai",
      category: "GRAMINEA",
    },
  },
  checklists: [
    {
        id: "check-1",
        checked: true,
        template: {
        id: "template-irrigacao",
        field_name: "Irrigação realizada",
        unit: "",
        },
    },
    {
        id: "check-2",
        checked: true,
        template: {
        id: "template-adubacao",
        field_name: "Adubação nitrogenada",
        unit: "",
        },
    },
    {
        id: "check-3",
        checked: false,
        template: {
        id: "template-pragas",
        field_name: "Controle de pragas",
        unit: "",
        },
    },
    {
        id: "check-4",
        checked: false,
        template: {
        id: "template-corte",
        field_name: "Corte/roçada",
        unit: "",
        },
    },
    {
        id: "check-5",
        checked: true,
        template: {
        id: "template-avaliacao",
        field_name: "Avaliação visual",
        unit: "",
        },
    },
    ],
  measurements: [
    {
      id: "med-1",
      value: 45,
      template: {
        id: "template-altura",
        field_name: "Altura da planta",
        unit: "cm",
      },
    },
    {
      id: "med-2",
      value: 72,
      template: {
        id: "template-cobertura",
        field_name: "Cobertura do solo",
        unit: "%",
      },
    },
    {
      id: "med-3",
      value: 14,
      template: {
        id: "template-perfilhos",
        field_name: "Nº de perfilhos",
        unit: "un.",
      },
    },
  ],
  photos: [
    {
      id: "photo-1",
      url: "/uploads/mock-1.jpg",
      takenAt: "2026-04-07T08:30:00.000Z",
    },
    {
      id: "photo-2",
      url: "/uploads/mock-2.jpg",
      takenAt: "2026-04-07T09:15:00.000Z",
    },
    {
      id: "photo-3",
      url: "/uploads/mock-3.jpg",
      takenAt: "2026-04-07T10:00:00.000Z",
    },
  ],
};

function formatDateTimeRange(formulario: FormularioCompleto) {
  const start = formulario.started_at
    ? new Date(formulario.started_at)
    : new Date(formulario.createdAt);

  const end = formulario.ended_at ? new Date(formulario.ended_at) : null;

  const date = start.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = end
    ? end.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return `${date} · ${startTime} – ${endTime}`;
}

function getMeasurementValue(
  formulario: FormularioCompleto,
  keyword: string,
  fallback: string
) {
  const measurement = formulario.measurements?.find((item) =>
    item.template?.field_name?.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!measurement) {
    return fallback;
  }

  return `${measurement.value}${measurement.template?.unit || ""}`;
}

export default function RegistroSalvoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [formulario, setFormulario] =
    useState<FormularioCompleto>(mockFormulario);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [usingMock, setUsingMock] = useState(true);

  const subtitle = useMemo(
    () => formatDateTimeRange(formulario),
    [formulario]
  );

  const altura = useMemo(
    () => getMeasurementValue(formulario, "altura", "45cm"),
    [formulario]
  );

  const cobertura = useMemo(
    () => getMeasurementValue(formulario, "cobertura", "72%"),
    [formulario]
  );

  const totalFotos = formulario.photos?.length || 0;

  const totalChecklist = formulario.checklists?.length || 0;
  
  const totalChecklistChecked =
  formulario.checklists?.filter((item) => item.checked).length || 0;

  useEffect(() => {
    async function loadFormulario() {
      if (!id || id === "mock-registro") {
        setUsingMock(true);
        return;
      }

      try {
        setLoading(true);

        const response = await getFormularioById(id);

        setFormulario(response.data);
        setUsingMock(false);
      } catch (error) {
        console.log("Usando registro mockado:", error);
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    }

    loadFormulario();
  }, [id]);

  async function handleSync() {
    try {
      setSyncing(true);

      await syncFormulario(String(id), {
        formulario: {
          observations: formulario.observations,
          ended_at: formulario.ended_at,
        },
        checklist: formulario.checklists?.map((item) => ({
          template_id: item.template?.id,
          checked: item.checked,
        })),
        measurements: formulario.measurements?.map((item) => ({
          template_id: item.template?.id,
          value: item.value,
        })),
        photos: formulario.photos?.map((item) => ({
          url: item.url,
        })),
      });

      setFormulario((current) => ({
        ...current,
        synced: true,
      }));

      Alert.alert("Sincronizado", "Registro sincronizado com sucesso.");
    } catch (error) {
      console.log("Erro ao sincronizar:", error);

      Alert.alert(
        "Não sincronizado",
        "Não foi possível sincronizar agora. Tente novamente depois."
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-14"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-slate-100"
          >
            <Text className="text-2xl text-slate-500">‹</Text>
          </Pressable>

          <Text className="flex-1 px-4 text-2xl font-bold text-slate-950">
            Registro Salvo
          </Text>

          {loading ? (
            <ActivityIndicator />
            ) : (
            <Pressable
                onPress={() => router.push("/registro")}
                className="rounded-full bg-emerald-100 px-4 py-3 active:opacity-80"
            >
                <Text className="text-sm font-bold text-emerald-800">✏️ Editar</Text>
            </Pressable>
        )}
        </View>

        <SuccessCard
          title="Registro salvo com sucesso!"
          subtitle={subtitle}
          synced={formulario.synced}
        />

        {usingMock && (
          <View className="mb-4 rounded-2xl bg-amber-50 px-4 py-3">
            <Text className="text-sm font-semibold text-amber-700">
              Visualização com dados de exemplo enquanto a API/banco é ajustada.
            </Text>
          </View>
        )}

        <View className="mb-4 flex-row gap-3">
          <SummaryMetricCard value={altura} label="Altura" />
          <SummaryMetricCard value={cobertura} label="Cobertura" />
          <SummaryMetricCard value={`${totalFotos}`} label="Fotos" />
        </View>

        <SavedSectionCard title="Fotos registradas" icon="📷">
          <PhotoPreviewList photos={formulario.photos || []} />
        </SavedSectionCard>

        <SavedSectionCard title="Medições" icon="📏">
          <MeasurementList measurements={formulario.measurements || []} />
        </SavedSectionCard>

        <SavedSectionCard
            title={`Checklist (${totalChecklistChecked}/${totalChecklist})`}
            icon="✅"
        >
            <SavedChecklistList items={formulario.checklists || []} />
        </SavedSectionCard>    
        <SavedSectionCard title="Observações" icon="📝">
          <Text className="text-base leading-6 text-slate-600">
            {formulario.observations || "Nenhuma observação registrada."}
          </Text>
        </SavedSectionCard>

        <View className="mt-2 flex-row gap-3">
          <Pressable
            onPress={() => router.replace("/")}
            className="h-14 flex-1 items-center justify-center rounded-2xl bg-slate-200 active:opacity-80"
          >
            <Text className="text-base font-bold text-slate-700">
              Ir para Home
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSync}
            disabled={syncing}
            className="h-14 flex-1 items-center justify-center rounded-2xl bg-emerald-800 active:opacity-80 disabled:opacity-60"
          >
            {syncing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-bold text-white">
                Sincronizar
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}