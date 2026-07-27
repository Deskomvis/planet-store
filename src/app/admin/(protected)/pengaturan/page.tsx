import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "settings" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">Pengaturan</h1>
      <div className="mt-6">
        <SettingsForm
          initialNumber={settings?.whatsappNumber ?? ""}
          initialTemplate={settings?.whatsappMessageTemplate ?? ""}
        />
      </div>
    </div>
  );
}
