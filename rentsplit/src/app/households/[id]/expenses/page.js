import { getUserSession } from "@/core/session";
import ManageExpensesPage from "@/components/expenses/ExpensesPage";

export default async function ExpensesPage() {
  const user = await getUserSession();

  return (
    <main className="p-4 bg-gray-50 min-h-screen">
      <ManageExpensesPage user={user}/>
    </main>
  );
}