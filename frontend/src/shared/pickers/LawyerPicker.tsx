import { listLawyers } from "../api/lawyers";
import { EntityPicker, type PickerOption } from "./EntityPicker";

async function searchLawyers(query: string): Promise<PickerOption[]> {
  // active: true — never offer a disabled Lawyer when linking a new record. Per SOFTDEL-11.
  const page = await listLawyers({ name: query || undefined, size: 10, active: true });
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
