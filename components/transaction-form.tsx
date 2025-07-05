"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction } from "@/types/transaction"

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transaction: Omit<Transaction, "id">) => void
  initialData?: Transaction | null
  mode: "add" | "edit"
}

interface FormData {
  amount: string
  description: string
  date: string
  category: string
  type: "income" | "expense"
}

interface FormErrors {
  amount?: string
  description?: string
  date?: string
  category?: string
}

export function TransactionForm({ isOpen, onClose, onSubmit, initialData, mode }: TransactionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    type: "expense",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          amount: Math.abs(initialData.amount).toString(),
          description: initialData.description,
          date: initialData.date,
          category: initialData.category,
          type: initialData.amount >= 0 ? "income" : "expense",
        })
      } else {
        setFormData({
          amount: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
          category: "",
          type: "expense",
        })
      }
      setErrors({})
    }
  }, [isOpen, initialData])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Amount validation
    const amount = Number.parseFloat(formData.amount)
    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.trim().length < 3) {
      newErrors.description = "Description must be at least 3 characters"
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Date is required"
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.date = "Date cannot be in the future"
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const amount = Number.parseFloat(formData.amount)
      const finalAmount = formData.type === "expense" ? -amount : amount

      const transaction: Omit<Transaction, "id"> = {
        amount: finalAmount,
        description: formData.description.trim(),
        date: formData.date,
        category: formData.category,
      }

      await onSubmit(transaction)
    } catch (error) {
      console.error("Error submitting transaction:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Income",
    "Other",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update the transaction details below." : "Enter the details for your new transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense") => handleInputChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "edit" ? "Update" : "Add"} Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
