'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/ui/sidebar";

export default function ManageExpensesPage() {
  const { id: householdId } = useParams();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [period, setPeriod] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [paidBy, setPaidBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dueDate, setDueDate] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (res.ok) setCurrentUser(data);
      else console.error("Failed to fetch user");
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/expenses/${householdId}`);
      const data = await res.json();
      if (res.ok) setExpenses(data.expenses);
      else alert("Failed to load expenses.");
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/household/${householdId}`);
      const data = await res.json();
      if (res.ok) setMembers(data.allMembers);
      else alert("Failed to load members.");
    } catch (err) {
      console.error("Members fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchExpenses();
    fetchMembers();
  }, [householdId]);

  const handleCreateOrUpdateExpense = async () => {
    setLoading(true);
    const url = editingExpenseId
      ? `/api/expenses/${householdId}/${editingExpenseId}/update`
      : `/api/expenses/${householdId}/add`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category: category === "Other" ? customCategory : category,
          paid_by: paidBy,
          date: period,
          due_date: dueDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchExpenses();
        resetForm();
      } else {
        alert(data.message || "Error creating expense");
      }
    } catch (err) {
      console.error("Error creating expense:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/expenses/${householdId}/${id}/delete`, { method: "DELETE" });
      if (res.ok) {
        setExpenses(expenses.filter(exp => exp._id !== id));
      } else {
        alert("Failed to delete expense.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense._id);
    setAmount(expense.amount);
    setCategory(expense.category);
    setPaidBy(expense.paid_by);
    setPeriod(expense.period || "");
    setDueDate(expense.dueDate || "");
  };

  const resetForm = () => {
    setEditingExpenseId(null);
    setAmount("");
    setCategory("");
    setCustomCategory("");
    setPaidBy("");
    setPeriod("");
    setDueDate("");
  };

  return (
    <div className="flex">
      <Sidebar user={currentUser} />
      <div className="flex-1 ml-64 p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manage Expenses</h1>

        <Card>
          <CardHeader>
            <CardTitle>{editingExpenseId ? "Edit Expense" : "Add New Expense"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div>
              <label className="block mb-1 text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded-md w-full"
              >
                <option value="">Select Category</option>
                <option value="Rent">Rent</option>
                <option value="Gas">Gas</option>
                <option value="Heat">Heat</option>
                <option value="Water">Water</option>
                <option value="Internet">Internet</option>
                <option value="Electricity">Electricity</option>
                <option value="Groceries">Groceries</option>
                <option value="Other">Other</option>
              </select>
              {category === "Other" && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="border p-2 rounded-md mt-2 w-full"
                />
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Period</label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border p-2 rounded-md w-full"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Who Paid?</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="border p-2 rounded-md w-full"
              >
                <option value="">Select Member</option>
                {members.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username || user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border p-2 rounded-md w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateOrUpdateExpense} disabled={loading}>
                {loading ? (editingExpenseId ? "Updating..." : "Creating...") : editingExpenseId ? "Update" : "Add Expense"}
              </Button>
              {editingExpenseId && (
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenses.length === 0 ? (
              <p className="text-gray-500">No expenses recorded.</p>
            ) : (
              expenses.map((exp) => (
                <div key={exp._id} className="border p-2 rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium">{exp.category}</div>
                    <div className="text-sm text-gray-500">
                      ${exp.amount.toFixed(2)} —{" "}
                      {new Date(exp.date).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </div>
                  </div>
                  {exp.paid_by._id === currentUser._id && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEditExpense(exp)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteExpense(exp._id)}>Delete</Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
