import { listLawyers } from "../api/lawyers";
import { EntityPicker, type PickerOption } from "./EntityPicker";

async function searchLawyers(query: string): Promise<PickerOption[]> {
  const page = await listLawyers({ name: query || undefined, size: 10 });
  return page.content.map((l) => ({ id: l.id, label: l.name, sublabel: l.oab ? `OAB ${l.oab}` : undefined }));
}

interface LawyerPickerProps {
  label: string;
  value: number | null;
  valueLabel?: string;
  onChange: (id: number | null, option: PickerOption | null) => void;
  error?: string;
  disabled?: boolean;
}

export function LawyerPicker(props: LawyerPickerProps) {
  return <EntityPicker {...props} placeholder="Buscar por nome" search={searchLawyers} />;
}
