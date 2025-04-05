import { getUserSession } from "@/core/session";
import RentSplitDashboard from "@/components/RentSplitDashboard";

export default async function DashboardPage() {
  const user = await getUserSession();

  return (
    <main className="p-4 bg-gray-50 min-h-screen">
      <RentSplitDashboard />
    </main>
  );
}
