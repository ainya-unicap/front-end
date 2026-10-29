import {
  Buildings,
  CalendarBlank,
  Camera,
  ChartBar,
  Check,
  ClipboardText,
  Cloud,
  CloudRain,
  EnvelopeSimple,
  FileText,
  Flower,
  GearSix,
  GlobeHemisphereWest,
  GraduationCap,
  House,
  Image,
  Info,
  Leaf,
  LockKey,
  Note,
  Package,
  PencilSimple,
  Plant,
  Sparkle,
  Sun,
  Tree,
  User,
  Users,
  Warning as WarningIcon,
  type Icon,
  type IconWeight,
} from "phosphor-react-native";

const iconComponents = {
  buildings: Buildings,
  calendar: CalendarBlank,
  camera: Camera,
  chart: ChartBar,
  check: Check,
  clipboard: ClipboardText,
  cloud: Cloud,
  cloudRain: CloudRain,
  envelope: EnvelopeSimple,
  file: FileText,
  flower: Flower,
  gear: GearSix,
  globe: GlobeHemisphereWest,
  graduation: GraduationCap,
  house: House,
  image: Image,
  info: Info,
  leaf: Leaf,
  lock: LockKey,
  note: Note,
  package: Package,
  pencil: PencilSimple,
  plant: Plant,
  sparkle: Sparkle,
  sun: Sun,
  tree: Tree,
  user: User,
  users: Users,
  warning: WarningIcon,
} satisfies Record<string, Icon>;

export type AppIconName = keyof typeof iconComponents;

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
};

export function AppIcon({
  name,
  size = 20,
  color = "#065f46",
  weight = "regular",
}: AppIconProps) {
  const IconComponent = iconComponents[name];
  return <IconComponent size={size} color={color} weight={weight} />;
}

const plantCategoryIcons: Record<string, AppIconName> = {
  CACTACEA: "plant",
  CULTURA_ANUAL: "plant",
  GRAMINEA_PORTE_ALTO: "plant",
  GRAMINEA_PORTE_BAIXO: "leaf",
  GRAMINEA_PORTE_MEDIO: "leaf",
  LEGUMINOSA_ARBUSTIVA: "tree",
  LEGUMINOSA_HERBACEA: "leaf",
  OLEAGINOSA_FORRAGEIRA: "flower",
};

export function getPlantCategoryIcon(category?: string): AppIconName {
  return plantCategoryIcons[category ?? ""] ?? "plant";
}
