"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  Bell,
  CreditCard,
  User,
  Calendar,
  AlertTriangle,
  Home,
  Droplet,
  ShoppingCart,
  Wifi,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/ui/sidebar";

// Enhanced color palette
const COLORS = ["#1a56db", "#10b981", "#f59e0b", "#ec4899"];

// Utility to format currency
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

// Animated number counter component
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // Animation duration in ms
    const start = 0;
    const end = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    const increment = end / (duration / 16); // ~60fps
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setDisplayValue(formatCurrency(current));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

// StatCard component for hero metric strip
const StatCard = ({ title, value, icon }) => (
  <Card className="border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition">
    <CardContent className="p-4 bg-white flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        <p className="text-xl font-bold text-slate-800">
          <AnimatedNumber value={value} />
        </p>
      </div>
    </CardContent>
  </Card>
);

// Status badge component
const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case "overdue":
      return (
        <Badge
          variant="destructive"
          className="bg-gradient-to-r from-red-600 to-red-500 text-white font-medium"
        >
          Overdue
        </Badge>
      );
    case "due soon":
      return (
        <Badge
          variant="outline"
          className="border-amber-500 text-amber-600 font-medium bg-amber-50"
        >
          Due Soon
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-slate-500 text-slate-700 font-medium bg-slate-50"
        >
          Pending
        </Badge>
      );
    case "paid":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500 text-emerald-600 font-medium bg-emerald-50"
        >
          Paid
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-medium">
          {status}
        </Badge>
      );
  }
};

const RentSplitDashboard = ({ user }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expenseSplits, setExpenseSplits] = useState([]);
  const [loadingSplits, setLoadingSplits] = useState(true);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [activeHousehold, setActiveHousehold] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  const [membersByHousehold, setMembersByHousehold] = useState({});
  const [budgetData, setBudgetData] = useState([]);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [isXlOrBigger, setIsXlOrBigger] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const totalBudget = budgetData.reduce((sum, item) => sum + item.value, 0);
  const householdSize = selectedHouseholdId
    ? membersByHousehold.find((h) => h._id === selectedHouseholdId)?.members
        .length || 1
    : 1;

  // Detect screen size for sidebar collapse
  useEffect(() => {
    const checkScreenSize = () => {
      setIsXlOrBigger(window.innerWidth >= 1280);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch user and household data
  useEffect(() => {
    const fetchUserAndHouseholds = async () => {
      try {
        const userRes = await fetch("/api/user");
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error("Failed to fetch user");

        setCurrentUser(userData);

        const householdRes = await fetch("/api/household/get");
        const householdMembers = await fetch("/api/household/dashboard");
        const members = await householdMembers.json();
        const householdData = await householdRes.json();
        if (!householdRes.ok) throw new Error("Failed to fetch households");
        setHouseholds(householdData.households);
        setMembersByHousehold(members.households);

        // Automatically select the first household if available
        if (householdData.households.length > 0 && !selectedHouseholdId) {
          setSelectedHouseholdId(householdData.households[0]._id);
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndHouseholds();
  }, []);

  // Fetch expense splits
  useEffect(() => {
    const fetchExpenseSplits = async () => {
      try {
        const res = await fetch(`/api/expensessplits/${currentUser._id}`);
        const data = await res.json();
        setExpenseSplits(data.splits || []);
      } catch (err) {
        console.error("Error loading splits:", err);
      } finally {
        setLoadingSplits(false);
      }
    };

    if (currentUser?._id) {
      fetchExpenseSplits();
    }
  }, [currentUser]);

  // Transform expense splits into transactions
  const transformedTransactions = expenseSplits.map((split) => {
    const exp = split.expense_id;
    const due = new Date(split.due_date);
    const now = new Date();
    const diffDays = Math.floor((due - now) / (1000 * 60 * 60 * 24));

    let status = split.status?.toLowerCase() || "pending";
    if (status !== "paid") {
      if (diffDays < 0) status = "overdue";
      else if (diffDays <= 3) status = "due soon";
    }

    return {
      id: split._id,
      description: exp?.category || "Unknown",
      amount: split.amount,
      dueDate: due.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
      status,
      paidToId: split.paid_to,
      householdId: split.household_id,
      payerId: split.user_id,
    };
  });

  // Fetch household expenses
  useEffect(() => {
    const fetchHouseholdExpenses = async () => {
      if (!selectedHouseholdId) return;
      try {
        const res = await fetch(`/api/expenses/${selectedHouseholdId}`);
        const data = await res.json();
        if (res.ok) {
          const grouped = data.expenses.reduce((acc, exp) => {
            const key = exp.category || "Uncategorized";
            acc[key] = (acc[key] || 0) + exp.amount;
            return acc;
          }, {});
          const chartData = Object.entries(grouped).map(([name, value]) => ({
            name,
            value,
            icon: getTransactionIcon(name),
          }));
          setBudgetData(chartData);
        } else {
          console.error("Failed to fetch household expenses", data.message);
          setBudgetData([]);
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setBudgetData([]);
      }
    };

    fetchHouseholdExpenses();
  }, [selectedHouseholdId]);

  // Calculate pending payments
  useEffect(() => {
    if (!selectedHouseholdId || !membersByHousehold) return;

    const activeHousehold = membersByHousehold.find(
      (h) => h._id === selectedHouseholdId
    );
    if (!activeHousehold) {
      setPendingPayments(0);
      return;
    }

    const total = activeHousehold.members.reduce(
      (sum, member) => sum + (member.amountOwedToCurrentUser || 0),
      0
    );

    setPendingPayments(total);
  }, [selectedHouseholdId, membersByHousehold]);

  // Handle adding a member
  const handleAddMember = async () => {
    if (!newMemberEmail || !activeHousehold) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/household/${activeHousehold._id}/member/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newMemberEmail,
            householdName: activeHousehold.name,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Member added!");
        setNewMemberEmail("");
        setShowAddMemberModal(false);
      } else {
        alert(`Failed to add member: ${data.message}`);
      }
    } catch (err) {
      console.error("Add member error:", err);
      alert("Error adding member.");
    } finally {
      setLoading(false);
    }
  };

  // Initiate PayPal payment
  const initiatePayPalPayment = async (txn) => {
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerId: txn.payerId,
          receiverId: txn.paidToId,
          expenseSplitId: txn.id,
          amount: txn.amount,
          householdId: txn.householdId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        const approvalUrl = data.links?.find(
          (link) => link.rel === "approve"
        )?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        } else {
          alert("No PayPal approval link found.");
        }
      } else {
        alert("Failed to create PayPal order.");
        console.error("PayPal order error:", data);
      }
    } catch (err) {
      console.error("PayPal order creation failed:", err);
    }
  };

  // Transaction icon helper
  const getTransactionIcon = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("rent")) return <Home size={20} />;
    if (
      lowerType.includes("util") ||
      lowerType.includes("water") ||
      lowerType.includes("electric")
    )
      return <Droplet size={20} />;
    if (lowerType.includes("grocery") || lowerType.includes("food"))
      return <ShoppingCart size={20} />;
    if (lowerType.includes("internet") || lowerType.includes("wifi"))
      return <Wifi size={20} />;
    return <CreditCard size={20} />;
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sticky sidebar */}
      <aside className="sticky left-0 top-0 h-screen w-72 border-r bg-white">
        <Sidebar user={user} collapsed={isXlOrBigger} />
      </aside>

      <div className="px-6 lg:px-12 xl:px-24 2xl:px-32 w-full">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 bg-white px-4 py-3 shadow-sm">
          <h1 className="text-3xl font-bold mb-3 text-slate-800 tracking-tight">
            RentSplit Dashboard
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-700 font-medium">
              Monthly Budget:{" "}
              <span className="text-slate-900 font-semibold">
                {formatCurrency(totalBudget)}
              </span>
              <span className="mx-2 text-slate-400">•</span>
              Pending:{" "}
              <span className="text-amber-600 font-semibold">
                {formatCurrency(pendingPayments)}
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1 text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm"
              >
                <Calendar size={16} />
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md transition-all duration-300 hover:shadow-lg"
                onClick={() => setShowHouseholdModal(true)}
              >
                <Plus size={18} className="mr-1" /> Add Expense
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md transition-all duration-300 hover:shadow-lg"
                onClick={() => setShowHistoryDrawer(true)}
              >
                <History size={18} className="mr-1" /> View History
              </Button>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <label className="text-slate-700 font-medium text-sm">
              Select Household:
            </label>
            <select
              className="border border-slate-300 rounded px-3 py-2 text-slate-700"
              value={selectedHouseholdId || ""}
              onChange={(e) => setSelectedHouseholdId(e.target.value)}
            >
              <option value="" disabled>
                -- Choose Household --
              </option>
              {households.map((household) => (
                <option key={household._id} value={household._id}>
                  {household.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Section 1: Hero stats + Quick Actions + Alerts */}
        <section className="bg-white py-8">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 mb-8">
            <StatCard
              title="Total Spent"
              value={formatCurrency(totalBudget)}
              icon={<CreditCard size={24} />}
            />
            <StatCard
              title="Pending"
              value={formatCurrency(pendingPayments)}
              icon={<Bell size={24} />}
            />
            <StatCard
              title="Avg. per Person"
              value={formatCurrency(totalBudget / householdSize)}
              icon={<User size={24} />}
            />
          </div>

          {/* Quick Actions Section - 1x4 Grid */}
          <Card className="border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition mb-8">
            <CardHeader className="px-4 py-3 border-b bg-white">
              <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
            </CardHeader>
            <CardContent className="bg-white px-4 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col h-28 items-center justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow"
                  onClick={() => setShowHouseholdModal(true)}
                >
                  <Plus size={24} className="mb-2 text-teal-500" />
                  <span className="font-medium">New Expense</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-28 items-center justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <User size={24} className="mb-2 text-indigo-500" />
                  <span className="font-medium">Add Member</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-28 items-center justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow"
                >
                  <Bell size={24} className="mb-2 text-amber-500" />
                  <span className="font-medium">Reminders</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-28 items-center justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow"
                >
                  <CreditCard size={24} className="mb-2 text-purple-500" />
                  <span className="font-medium">Setup Auto-Pay</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reminder Alert with Updated Styling */}
          {pendingPayments > 0 && (
            <Alert className="mb-6 border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-black font-semibold text-lg">
              </AlertTitle>
              <AlertDescription className="text-black text-base leading-relaxed">
                <span className="font-bold text-black">
                  REMINDER:
                  allyhoang owes {formatCurrency(500)} for utilities, due in 2 days.
                </span>
                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-sm hover:shadow transition-all duration-300"
                  >
                    <Bell size={14} className="mr-1" /> Send Reminder
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
                  >
                    Auto-Pay
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </section>

        {/* Section 2: Charts & Breakdown */}
        <section className="bg-slate-50 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 h-[calc(100vh-240px)]">
            <Card className="border-slate-200 shadow-md flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition">
              <CardHeader className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-800">
                  Budget Breakdown
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-teal-600 hover:text-teal-800 hover:bg-teal-50 font-medium transition-colors duration-300"
                >
                  {showBreakdown ? "Hide Details" : "Show Details"}
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto bg-white px-4 py-3">
                <ScrollArea className="h-full pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  <div className="flex flex-col items-center">
                    {budgetData.length === 0 ? (
                      <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex flex-col items-center">
                          <CreditCard size={24} className="text-slate-400 mb-2" />
                          <p className="font-medium">
                            {selectedHouseholdId
                              ? "No expenses found for this household"
                              : "Please select a household to view the budget breakdown"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={budgetData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={3}
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                            labelLine={false}
                          >
                            {budgetData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="white"
                                strokeWidth={2}
                              />
                            ))}
                            <Label
                              position="center"
                              value={formatCurrency(totalBudget)}
                              fontSize={18}
                              fontWeight="bold"
                              fill="#334155"
                            />
                          </Pie>
                          <Tooltip
                            formatter={(value) => [formatCurrency(value), "Amount"]}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              backgroundColor: "white",
                              padding: "8px 12px",
                              fontSize: "14px",
                              fontWeight: 500,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}

                    {showBreakdown && budgetData.length > 0 && (
                      <div className="mt-6 w-full bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 text-slate-800">
                          Monthly Expenses
                        </h3>
                        <div className="space-y-4">
                          {budgetData.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors"
                            >
                              <div className="flex items-center">
                                <div
                                  className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-white"
                                  style={{
                                    backgroundColor: COLORS[index % COLORS.length],
                                  }}
                                >
                                  {item.icon}
                                </div>
                                <span className="text-slate-700 font-medium">
                                  {item.name}
                                </span>
                              </div>
                              <span className="font-semibold text-slate-800">
                                {formatCurrency(item.value)}
                              </span>
                            </div>
                          ))}
                          <div className="pt-4 mt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 bg-slate-50 p-3 rounded">
                            <span>Total</span>
                            <span>{formatCurrency(totalBudget)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-md flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition">
              <CardHeader className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-800">
                  Upcoming Transactions
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant={activeFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter("all")}
                    className={
                      activeFilter === "all"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
                    }
                  >
                    All
                  </Button>
                  <Button
                    variant={activeFilter === "overdue" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter("overdue")}
                    className={
                      activeFilter === "overdue"
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm"
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
                    }
                  >
                    Overdue
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto bg-white px-4 py-3">
                <ScrollArea className="h-full pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {loadingSplits ? (
                    <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="animate-pulse flex flex-col items-center">
                        <div className="h-8 w-8 bg-slate-300 rounded-full mb-2"></div>
                        <div className="h-4 w-32 bg-slate-300 rounded mb-1"></div>
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  ) : transformedTransactions.length === 0 ? (
                    <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex flex-col items-center">
                        <CreditCard size={24} className="text-slate-400 mb-2" />
                        <p className="font-medium">No upcoming transactions</p>
                        <p className="text-sm text-slate-400">
                          All expenses are paid!
                        </p>
                      </div>
                    </div>
                  ) : (
                    transformedTransactions
                      .filter(
                        (txn) =>
                          activeFilter === "all" || txn.status === activeFilter
                      )
                      .map((txn) => (
                        <div
                          key={txn.id}
                          className="p-4 border border-slate-200 rounded-lg flex justify-between items-center hover:border-slate-300 hover:bg-white transition-all duration-300 shadow-sm hover:shadow mb-3"
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 text-white
                                ${
                                  txn.status === "overdue"
                                    ? "bg-red-500"
                                    : txn.status === "due soon"
                                    ? "bg-amber-500"
                                    : txn.status === "pending"
                                    ? "bg-slate-500"
                                    : "bg-emerald-500"
                                }`}
                            >
                              {getTransactionIcon(txn.description)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">
                                {txn.description}
                              </div>
                              <div className="text-sm text-slate-600">
                                Due: {txn.dueDate}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-slate-800">
                                {formatCurrency(txn.amount)}
                              </div>
                              {getStatusBadge(txn.status)}
                            </div>
                            {txn.status !== "paid" && (
                              <Button
                                size="sm"
                                className={`shadow-sm hover:shadow transition-all duration-300
                                  ${
                                    txn.status === "overdue"
                                      ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                                      : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                                  } 
                                  text-white`}
                                onClick={() => initiatePayPalPayment(txn)}
                              >
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-md flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition">
              <CardHeader className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-800">
                  Household Members
                </h2>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto bg-white px-4 py-3">
                <ScrollArea className="h-full pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {selectedHouseholdId ? (
                    membersByHousehold
                      .find((h) => h._id === selectedHouseholdId)
                      ?.members.map((member, index) => (
                        <div
                          key={index}
                          className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow bg-white mb-3"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 w-full min-w-0">
                              <div
                                className={`h-10 w-10 rounded-full text-white flex items-center justify-center font-medium shrink-0 ${
                                  member.owedAmount > 0
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-500"
                                }`}
                              >
                                {member.username?.charAt(0) ||
                                  member.email.charAt(0)}
                              </div>
                              <span
                                className="font-semibold text-slate-800 text-sm truncate"
                                title={member.username || member.email}
                              >
                                {member.username || member.email}
                              </span>
                            </div>
                            {getStatusBadge(
                              member.amountOwedToCurrentUser > 0
                                ? "pending"
                                : "paid"
                            )}
                          </div>

                          {member.amountOwedToCurrentUser > 0 && (
                            <div className="text-sm text-slate-600 mb-3 p-2 bg-amber-50 border border-amber-100 rounded">
                              Owes:{" "}
                              <span className="font-bold text-amber-600">
                                {formatCurrency(member.amountOwedToCurrentUser)}
                              </span>
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm flex-1"
                            >
                              View History
                            </Button>
                            {member.owedAmount > 0 && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm shadow-sm flex-1"
                              >
                                <Bell size={14} className="mr-1" />
                                Remind
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-slate-500">
                      Please select a household to view members.
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Floating action button for mobile */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 md:hidden flex items-center justify-center transition-all duration-300 hover:shadow-xl"
          aria-label="Add new expense"
        >
          <Plus size={26} />
        </Button>

        {/* Household selection modal */}
        {showHouseholdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-none" />
            <div className="relative z-10 bg-white shadow-xl rounded-lg p-6 max-w-md w-full pointer-events-auto">
              <h2 className="text-lg font-bold mb-4 text-slate-800">
                Select a Household
              </h2>
              <div className="space-y-3">
                {households.length > 0 ? (
                  households.map((household) => (
                    <Button
                      key={household._id}
                      onClick={() => {
                        setShowHouseholdModal(false);
                        window.location.href = `/households/${household._id}/expenses`;
                      }}
                      className="w-full text-left justify-start border border-slate-200 shadow-sm bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:to-emerald-300 active:bg-gradient-to-r active:from-blue-500 active:to-emerald-500 text-black transition-all duration-200"
                    >
                      🏠{" "}
                      <span className="ml-2 text-black">{household.name}</span>
                    </Button>
                  ))
                ) : (
                  <p className="text-slate-500">No households found.</p>
                )}
              </div>
              <div className="mt-6 text-right">
                <Button
                  variant="outline"
                  onClick={() => setShowHouseholdModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add member modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Add a Household Member
              </h2>
              <div className="space-y-4">
                <label className="block text-slate-700 text-sm font-medium">
                  Select Household
                </label>
                <select
                  className="w-full border border-slate-300 rounded px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={activeHousehold?._id || ""}
                  onChange={(e) => {
                    const selected = households.find(
                      (h) => h._id === e.target.value
                    );
                    setActiveHousehold(selected);
                  }}
                >
                  <option value="" disabled>
                    Select a household
                  </option>
                  {households.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>

                <input
                  type="email"
                  placeholder="member@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddMemberModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!newMemberEmail || !activeHousehold}
                    onClick={handleAddMember}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  >
                    Add Member
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History drawer */}
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowHistoryDrawer(false)}
            />
            <div className="relative w-full max-w-md bg-white shadow-xl p-6 h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-slate-800">
                Expense History
              </h2>
              <p className="text-slate-600 mb-4">
                View detailed expense history or export as CSV.
              </p>
              <div className="space-y-4">
                <p className="text-slate-500">
                  Expense history will be displayed here.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white"
                  disabled
                >
                  Export as CSV (Coming Soon)
                </Button>
              </div>
              <div className="mt-6 text-right">
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryDrawer(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Typography scaling for large screens */}
      <style jsx global>{`
        @media (min-width: 1600px) {
          html {
            font-size: 112%;
          }
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-200 {
          scrollbar-color: #e5e7eb transparent;
        }
      `}</style>
    </div>
  );
};

export default RentSplitDashboard;