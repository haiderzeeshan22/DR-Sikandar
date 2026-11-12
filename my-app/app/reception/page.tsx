import { redirect } from "next/navigation";
import { ReceptionDashboard } from "@/components/reception/ReceptionDashboard";
import { getReceptionSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReceptionPage() {
  const session = await getReceptionSession();

  if (!session) {
    redirect("/reception/login");
  }

  return <ReceptionDashboard />;
}
