import { getUserSession } from "@/core/session";
import HouseholdPage from "@/components/households/HouseholdComponent";

export default async function Household() {
  const user = await getUserSession();

  return (
    <main className="p-4 bg-gray-50 min-h-screen">
      <HouseholdPage user={user}/>
    </main>
  );
}
