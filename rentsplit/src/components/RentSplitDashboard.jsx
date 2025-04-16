'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Bell, CreditCard, User, Calendar, AlertTriangle, Home, Droplet, ShoppingCart, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/ui/sidebar";

const budgetData = [
  { name: "Rent", value: 1200, icon: <Home size={16} /> },
  { name: "Utilities", value: 150, icon: <Droplet size={16} /> },
  { name: "Groceries", value: 300, icon: <ShoppingCart size={16} /> },
  { name: "Internet", value: 50, icon: <Wifi size={16} /> },
];

// Enhanced color palette with vibrant, high-contrast colors
const COLORS = ["#1a56db", "#10b981", "#f59e0b", "#ec4899"];

const householdMembers = [
  { name: "Emma", status: "Paid", owes: 0, avatar: "E" },
  { name: "Jake", status: "Pending", owes: 150, avatar: "J" },
  { name: "Sophia", status: "Paid", owes: 0, avatar: "S" },
  { name: "Liam", status: "Pending", owes: 75, avatar: "L" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case "overdue":
      return <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-red-500 text-white font-medium">Overdue</Badge>;
    case "due soon":
      return <Badge variant="outline" className="border-amber-500 text-amber-600 font-medium bg-amber-50">Due Soon</Badge>;
    case "pending":
      return <Badge variant="outline" className="border-slate-500 text-slate-700 font-medium bg-slate-50">Pending</Badge>;
    case "paid":
      return <Badge variant="outline" className="border-emerald-500 text-emerald-600 font-medium bg-emerald-50">Paid</Badge>;
    default:
      return <Badge variant="outline" className="font-medium">{status}</Badge>;
  }
};

const RentSplitDashboard = ({ user }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expenseSplits, setExpenseSplits] = useState([]);
  const [loadingSplits, setLoadingSplits] = useState(true);

  const totalBudget = budgetData.reduce((sum, item) => sum + item.value, 0);
  const pendingPayments = householdMembers
    .filter((member) => member.status.toLowerCase() === "pending")
    .reduce((sum, member) => sum + member.owes, 0);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (res.ok) setCurrentUser(data);
        else console.error("Failed to fetch user");
      } catch (err) {
        console.error("User fetch error:", err);
      } finally {
        setLoadingUser(false);
      }
    };
  
    fetchUser();
  }, []);    

  useEffect(() => {
    const fetchExpenseSplits = async () => {
      try {
        const res = await fetch(`/api/expensessplits/${currentUser._id}`);
        const data = await res.json();
        console.log(data);
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

  const transformedTransactions = expenseSplits.map((split) => {
    const exp = split.expense_id;
    const due = new Date(split.due_date);
    const now = new Date();
    const diffDays = Math.floor((due - now) / (1000 * 60 * 60 * 24));
    let status = split.status?.toLowerCase() || "pending";
    if (diffDays < 0) status = "overdue";
    else if (diffDays <= 3) status = "due soon";
  
    return {
      id: split._id,
      description: exp?.category || "Unknown",
      amount: split.amount,
      dueDate: due.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      status,
      paidToId: split.paid_to,
      householdId: split.household_id,
      payerId: split.user_id,
    };
  });    

  const initiatePayPalPayment = async (txn) => {
    try {
      console.log(txn)
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
        const approvalUrl = data.links?.find(link => link.rel === "approve")?.href;
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
  
  // Helper function to get icon for transaction type
  const getTransactionIcon = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("rent")) return <Home size={20} />;
    if (lowerType.includes("util") || lowerType.includes("water") || lowerType.includes("electric")) return <Droplet size={20} />;
    if (lowerType.includes("grocery") || lowerType.includes("food")) return <ShoppingCart size={20} />;
    if (lowerType.includes("internet") || lowerType.includes("wifi")) return <Wifi size={20} />;
    return <CreditCard size={20} />;
  };

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <Sidebar user={user} />
      <div className="p-6 max-w-6xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-3 text-slate-800 tracking-tight">RentSplit Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-slate-700 font-medium">
              Monthly Budget: <span className="text-slate-900 font-semibold">{formatCurrency(totalBudget)}</span> • 
              Pending: <span className="text-amber-600 font-semibold">{formatCurrency(pendingPayments)}</span>
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1 text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm"
              >
                <Calendar size={16} /> March 2025
              </Button>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md transition-all duration-300 hover:shadow-lg"
              >
                <Plus size={18} className="mr-1" /> Add Expense
              </Button>
            </div>
          </div>
        </header>

        {pendingPayments > 0 && (
          <Alert className="mb-6 border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-black font-semibold text-lg">Hey, don't forget!</AlertTitle>
            <AlertDescription className="text-black">
              Jake owes <span className="font-semibold text-black">{formatCurrency(150)}</span> for utilities, due in 2 days.
              <div className="mt-3">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white mr-2 shadow-sm hover:shadow transition-all duration-300"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 bg-white">
                <CardTitle className="text-xl text-slate-800 flex items-center justify-between">
                  <span className="font-bold">Budget Breakdown</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="text-teal-600 hover:text-teal-800 hover:bg-teal-50 font-medium transition-colors duration-300"
                  >
                    {showBreakdown ? "Hide Details" : "Show Details"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-slate-50">
                <div className="flex flex-col lg:flex-row items-center justify-between">
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
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
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
                          borderRadius: '8px', 
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'white',
                          padding: '8px 12px',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {showBreakdown && (
                    <div className="mt-6 lg:mt-0 lg:w-1/2 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-bold mb-4 text-slate-800">Monthly Expenses</h3>
                      <div className="space-y-4">
                        {budgetData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors">
                            <div className="flex items-center">
                              <div
                                className="h-8 w-8 rounded-full mr-3 flex items-center justify-center text-white"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              >
                                {item.icon}
                              </div>
                              <span className="text-slate-700 font-medium">{item.name}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
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
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 bg-white">
                <CardTitle className="text-xl text-slate-800 flex items-center justify-between">
                  <span className="font-bold">Upcoming Transactions</span>
                  <div className="flex gap-1">
                    <Button
                      variant={activeFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                      className={activeFilter === "all" 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm" 
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"}
                    >
                      All
                    </Button>
                    <Button
                      variant={activeFilter === "overdue" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("overdue")}
                      className={activeFilter === "overdue" 
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm" 
                        : "border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"}
                    >
                      Overdue
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-slate-50">
                <ScrollArea className="h-64 pr-2">
                  <div className="space-y-3">
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
                          <p className="text-sm text-slate-400">All expenses are paid!</p>
                        </div>
                      </div>
                    ) : (
                      transformedTransactions
                        .filter((txn) => activeFilter === "all" || txn.status === activeFilter)
                        .map((txn) => (
                          <div
                            key={txn.id}
                            className="p-4 border border-slate-200 rounded-lg flex justify-between items-center hover:border-slate-300 hover:bg-white transition-all duration-300 shadow-sm hover:shadow"
                          >
                            <div className="flex items-center">
                              <div 
                                className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 text-white
                                  ${txn.status === 'overdue' ? 'bg-red-500' : 
                                    txn.status === 'due soon' ? 'bg-amber-500' :
                                    txn.status === 'pending' ? 'bg-slate-500' : 'bg-emerald-500'}`}
                              >
                                {getTransactionIcon(txn.description)}
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{txn.description}</div>
                                <div className="text-sm text-slate-600">Due: {txn.dueDate}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold text-slate-800">{formatCurrency(txn.amount)}</div>
                                {getStatusBadge(txn.status)}
                              </div>
                              {txn.status !== "paid" && (
                                <Button
                                  size="sm"
                                  className={`shadow-sm hover:shadow transition-all duration-300
                                    ${txn.status === 'overdue' 
                                      ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600' 
                                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'} 
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
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 bg-white">
                <CardTitle className="text-xl text-slate-800 font-bold">Household Members</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-slate-50">
                <ScrollArea className="h-64 pr-2">
                  <div className="space-y-4">
                    {householdMembers.map((member, index) => (
                      <div 
                        key={index} 
                        className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div 
                              className={`h-10 w-10 rounded-full text-white flex items-center justify-center font-medium mr-3
                                ${member.status.toLowerCase() === 'paid' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                            >
                              {member.avatar}
                            </div>
                            <span className="font-semibold text-slate-800 text-lg">{member.name}</span>
                          </div>
                          {getStatusBadge(member.status)}
                        </div>
                        {member.owes > 0 && (
                          <div className="text-sm text-slate-600 mb-3 p-2 bg-amber-50 border border-amber-100 rounded">
                            Owes: <span className="font-bold text-amber-600">{formatCurrency(member.owes)}</span>
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
                          {member.status.toLowerCase() === "pending" && (
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
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-md overflow-hidden">
              <CardHeader className="pb-2 border-b border-slate-100 bg-white">
                <CardTitle className="text-xl text-slate-800 font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-gradient-to-br from-white to-slate-50">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex flex-col h-28 items-center justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <Plus size={24} className="mb-2 text-teal-500" />
                    <span className="font-medium">New Expense</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col h-28 items-center justify-center border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow"
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
          </div>
        </div>

        <Button 
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 md:hidden flex items-center justify-center transition-all duration-300 hover:shadow-xl"
          aria-label="Add new expense"
        >
          <Plus size={26} />
        </Button>
      </div>
    </div>
  );
};

export default RentSplitDashboard;