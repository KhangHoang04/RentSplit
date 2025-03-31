'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Bell, CreditCard, User, Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const budgetData = [
  { name: "Rent", value: 1200 },
  { name: "Utilities", value: 150 },
  { name: "Groceries", value: 300 },
  { name: "Internet", value: 50 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const transactions = [
  { id: 1, description: "Rent Payment", amount: 1200, dueDate: "April 1st", status: "due soon" },
  { id: 2, description: "Electric Bill", amount: 150, dueDate: "April 5th", status: "pending" },
  { id: 3, description: "Grocery Split", amount: 75, dueDate: "March 28th", status: "overdue" },
  { id: 4, description: "Internet", amount: 50, dueDate: "April 10th", status: "pending" },
];

const householdMembers = [
  { name: "Emma", status: "Paid", owes: 0, avatar: "E" },
  { name: "Jake", status: "Pending", owes: 150, avatar: "J" },
  { name: "Sophia", status: "Paid", owes: 0, avatar: "S" },
  { name: "Liam", status: "Pending", owes: 75, avatar: "L" },
];

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(value);

const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case "overdue":
      return <Badge variant="destructive" className="bg-red-500">Overdue</Badge>;
    case "due soon":
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Due Soon</Badge>;
    case "pending":
      return <Badge variant="outline" className="border-gray-500 text-gray-700">Pending</Badge>;
    case "paid":
      return <Badge variant="outline" className="border-green-500 text-green-500">Paid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const RentSplitDashboard = () => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const totalBudget = budgetData.reduce((sum, item) => sum + item.value, 0);
  const pendingPayments = householdMembers
    .filter(member => member.status.toLowerCase() === "pending")
    .reduce((sum, member) => sum + member.owes, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-black">RentSplit Dashboard</h1>
        <div className="flex items-center justify-between">
          <p className="text-black">
            Monthly Budget: {formatCurrency(totalBudget)} • Pending: {formatCurrency(pendingPayments)}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Calendar size={16} /> March 2025
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={18} className="mr-1" /> Add Expense
            </Button>
          </div>
        </div>
      </header>

      {pendingPayments > 0 && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-black">Payment Reminder</AlertTitle>
          <AlertDescription className="text-black font-medium">
            Jake owes {formatCurrency(150)} for utilities, due in 2 days.
            <div className="mt-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 mr-2">Send Reminder</Button>
              <Button size="sm" variant="outline">Auto-Pay</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Budget Breakdown</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showBreakdown ? "Hide Details" : "Show Details"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie 
                      data={budgetData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={80} 
                      fill="#8884d8" 
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value), "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
                
                {showBreakdown && (
                  <div className="mt-4 lg:mt-0 lg:w-1/2">
                    <h3 className="text-lg font-medium mb-2">Monthly Expenses</h3>
                    <div className="space-y-2">
                      {budgetData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(item.value)}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t flex items-center justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(totalBudget)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Upcoming Transactions</span>
                <div className="flex gap-1">
                  <Button 
                    variant={activeFilter === "all" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setActiveFilter("all")}
                    className={activeFilter === "all" ? "bg-blue-600" : ""}
                  >
                    All
                  </Button>
                  <Button 
                    variant={activeFilter === "overdue" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setActiveFilter("overdue")}
                    className={activeFilter === "overdue" ? "bg-red-500" : ""}
                  >
                    Overdue
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {transactions
                    .filter(txn => activeFilter === "all" || txn.status === activeFilter)
                    .map((txn) => (
                    <div key={txn.id} className="p-3 border rounded-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 mr-3">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{txn.description}</div>
                          <div className="text-sm text-gray-700">Due: {txn.dueDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(txn.amount)}</div>
                          {getStatusBadge(txn.status)}
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Pay Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Household Members</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {householdMembers.map((member, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium mr-2">
                            {member.avatar}
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        {getStatusBadge(member.status)}
                      </div>
                      {member.owes > 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                          Owes: <span className="font-medium text-red-500">{formatCurrency(member.owes)}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs">View History</Button>
                        {member.status.toLowerCase() === "pending" && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                            <Bell size={12} className="mr-1" />
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
                  <Plus size={20} className="mb-1" />
                  <span>New Expense</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
                  <User size={20} className="mb-1" />
                  <span>Add Member</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
                  <Bell size={20} className="mb-1" />
                  <span>Reminders</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-20 items-center justify-center">
                  <CreditCard size={20} className="mb-1" />
                  <span>Setup Auto-Pay</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg bg-blue-600 hover:bg-blue-700 md:hidden flex items-center justify-center">
        <Plus size={24} />
      </Button>
    </div>
  );
};

export default RentSplitDashboard;
