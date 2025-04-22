import { getUserSession } from "@/core/session";
import ActivityPage from "@/components/activity/ActivityPage";

export default async function Activity() {
  const user = await getUserSession();

  return (
    <main className="p-4 bg-gray-50 min-h-screen">
      <ActivityPage user={user}/>
    </main>
  );
}