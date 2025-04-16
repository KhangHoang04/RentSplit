"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/ui/sidebar";

export default function ActivityPage() {
  const [expenses, setExpenses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  useEffect(() => {
    // Fetch user data
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => setCurrentUser(data))
      .catch(console.error);

    // Fetch all user expenses
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((data) => setExpenses(data.expenses || []))
      .catch(console.error);
  }, []);

  // Filter expenses based on user criteria
  const filteredExpenses = expenses.filter((exp) => {
    if (filters.category && exp.category !== filters.category) return false;
    
    const expDate = new Date(exp.date);
    if (filters.startDate && expDate < new Date(filters.startDate)) return false;
    if (filters.endDate && expDate > new Date(filters.endDate)) return false;
    if (filters.minAmount && exp.amount < +filters.minAmount) return false;
    if (filters.maxAmount && exp.amount > +filters.maxAmount) return false;
    
    return true;
  });

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  // Handle adding a new expense (redirect to the add expense page)
  const handleAddExpense = () => {
    // Navigate to add expense page or open modal
    window.location.href = "/expenses/add";
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar user={currentUser} />
      
      <div className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto py-8 px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between">
              <h1 className="text-3xl font-bold text-white">Activity</h1>
              <span className="text-sm text-gray-400">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'} found
              </span>
            </div>
            <p className="mt-2 text-gray-400">Track all household expenses in one place</p>
          </div>

          {/* Filter Card */}
          <Card className="mb-8 bg-white rounded-lg shadow-md sticky top-4 z-10">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                <Button 
                  variant="ghost" 
                  onClick={handleClearFilters} 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                    </div>
                    <select
                      id="category"
                      value={filters.category}
                      onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-black"
                    >
                      <option value="">All Categories</option>
                      <option>Rent</option>
                      <option>Gas</option>
                      <option>Heat</option>
                      <option>Water</option>
                      <option>Internet</option>
                      <option>Electricity</option>
                      <option>Groceries</option>
                    </select>
                  </div>
                </div>

                {/* Date Range Group */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="startDate"
                        aria-label="From date"
                        value={filters.startDate}
                        onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                        className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-black"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <input
                        type="date"
                        id="endDate"
                        aria-label="To date"
                        value={filters.endDate}
                        onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                        className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Amount Range Group */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        id="minAmount"
                        placeholder="Min"
                        aria-label="Minimum amount"
                        value={filters.minAmount}
                        onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))}
                        className="pl-8 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-black"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        id="maxAmount"
                        placeholder="Max"
                        aria-label="Maximum amount"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))}
                        className="pl-8 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card className="bg-white rounded-lg shadow-md overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-xl font-semibold text-gray-800">Expense Activity</CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                  <p className="text-gray-500">Loading your expenses...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-24 h-24 mb-6 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No matching expenses</h3>
                  <p className="text-gray-500 text-center mb-8">
                    Try adjusting your filters, or add a new expense to get started.
                  </p>
                  <Button onClick={handleAddExpense} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Expense
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Paid By
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExpenses.map((expense) => (
                          <tr key={expense._id} className="hover:bg-gray-50 group">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(expense.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  {expense.category === "Rent" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                  )}
                                  {expense.category === "Internet" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                                      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                      <line x1="12" y1="20" x2="12.01" y2="20"></line>
                                    </svg>
                                  )}
                                  {expense.category === "Water" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 2.69L5.6 9.5a6 6 0 0 0 11.83 0L12 2.69z"></path>
                                    </svg>
                                  )}
                                  {(expense.category === "Gas" || expense.category === "Heat") && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14.5 4.5a4 4 0 0 0-4 4c0 3.5 2 4.5 2 7.5 0 1.657-1.343 3-3 3S6.5 17.657 6.5 16a2 2 0 0 1 2-2"></path>
                                      <path d="M5 10a7 7 0 0 0 14 0 7 7 0 0 0-14 0Z"></path>
                                    </svg>
                                  )}
                                  {expense.category === "Electricity" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 15h4l-4 7h7l-3-6h5L7 3z"></path>
                                    </svg>
                                  )}
                                  {expense.category === "Groceries" && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
                                    </svg>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{expense.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${expense.amount?.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {expense.paid_by?.username || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                expense.status === "paid" ? "bg-green-100 text-green-800" : 
                                expense.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {expense.status || "Unknown"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="opacity-0 group-hover:opacity-100 flex justify-end space-x-2 transition-opacity">
                                <button className="text-blue-600 hover:text-blue-900" aria-label="Edit expense">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                </button>
                                <button className="text-red-600 hover:text-red-900" aria-label="Delete expense">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <div key={expense._id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              {expense.category === "Rent" && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                              )}
                              {/* Other category icons here */}
                            </div>
                            <div className="ml-3">
                              <div className="text-base font-medium text-gray-900">{expense.category}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-right">
                              <div className="text-base font-medium text-gray-900">
                                ${expense.amount?.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {expense.paid_by?.username || "Unknown"}
                              </div>
                            </div>
                            <div className="ml-4">
                              <button className="text-gray-400 hover:text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1"></circle>
                                  <circle cx="19" cy="12" r="1"></circle>
                                  <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            expense.status === "paid" ? "bg-green-100 text-green-800" : 
                            expense.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {expense.status || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}