import { listPeople } from "../api/people";
import { EntityPicker, type PickerOption } from "./EntityPicker";

async function searchPeople(query: string): Promise<PickerOption[]> {
  // active: true — never offer a disabled Person when linking a new record. Per SOFTDEL-11.
  const page = await listPeople({ name: query || undefined, size: 10, active: true });
  return page.content.map((p) => ({ id: p.id, label: p.name, sublabel: p.cpfCnpj ?? undefined }));
}

interface PersonPickerProps {
  label: string;
  value: number | null;
  valueLabel?: string;
  onChange: (id: number | null, option: PickerOption | null) => void;
  error?: string;
  disabled?: boolean;
}

export function PersonPicker(props: PersonPickerProps) {
  return <EntityPicker {...props} placeholder="Buscar por nome" search={searchPeople} />;
}
