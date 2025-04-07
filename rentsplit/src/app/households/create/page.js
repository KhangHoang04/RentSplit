import { getUserSession } from "@/core/session";
import CreateHouseholdPage from "@/components/households/HouseholdCreate";

export default async function HouseholdCreate() {
  const user = await getUserSession();

  return (
    <main className="p-4 bg-gray-50 min-h-screen">
      <CreateHouseholdPage user={user}/>
    </main>
  );
}