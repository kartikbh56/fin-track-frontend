"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyChart } from "@/components/monthly-chart"
import type { Transaction } from "@/types/transaction"
import { CategoryPieChart } from "@/components/category-pie-chart"

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem("transactions")
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      }
    } catch (err) {
      setError("Failed to load transactions from storage")
    }
  }, [])

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions))
    } catch (err) {
      setError("Failed to save transactions to storage")
    }
  }, [transactions])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
      }
      setTransactions((prev) => [newTransaction, ...prev])
      setIsFormOpen(false)
      setError(null)
    } catch (err) {
      setError("Failed to add transaction")
    }
  }

  const updateTransaction = (id: string, updatedTransaction: Omit<Transaction, "id">) => {
    try {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...updatedTransaction, id } : t)))
      setEditingTransaction(null)
      setIsFormOpen(false)
      setError(null)
    } catch (err) {
      setError("Failed to update transaction")
    }
  }

  const deleteTransaction = (id: string) => {
    try {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      setError(null)
    } catch (err) {
      setError("Failed to delete transaction")
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTransaction(null)
  }

  // Calculate summary statistics
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const monthlyIncome = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personal Finance</h1>
            <p className="text-gray-600">Track your income and expenses</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setError(null)} className="mt-2">
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ₹
{totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ₹
                {Math.abs(totalBalance).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalBalance >= 0 ? "Positive balance" : "Negative balance"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹
              {monthlyIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total income this period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹
              {monthlyExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total expenses this period</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>Your spending trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyChart transactions={transactions} />
              <CategoryPieChart transactions={transactions} />
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList
                transactions={transactions.slice(0, 5)}
                onEdit={handleEdit}
                onDelete={deleteTransaction}
                showActions={true}
              />
              {transactions.length > 5 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing 5 of {transactions.length} transactions
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>Complete list of your financial transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions yet</p>
                <Button variant="outline" onClick={() => setIsFormOpen(true)} className="mt-4">
                  Add your first transaction
                </Button>
              </div>
            ) : (
              <TransactionList
                transactions={transactions}
                onEdit={handleEdit}
                onDelete={deleteTransaction}
                showActions={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Transaction Form Dialog */}
        <TransactionForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingTransaction ? (data) => updateTransaction(editingTransaction.id, data) : addTransaction}
          initialData={editingTransaction}
          mode={editingTransaction ? "edit" : "add"}
        />
      </div>
    </div>
  )
}
