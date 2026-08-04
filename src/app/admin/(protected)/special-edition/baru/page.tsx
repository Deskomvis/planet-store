import { SpecialEditionEditor } from "@/components/admin/special-edition-editor";
import { newSpecialEditionValue } from "@/lib/special-edition";

export default function NewSpecialEditionPage() {
  return <SpecialEditionEditor initialValue={newSpecialEditionValue()} />;
}
