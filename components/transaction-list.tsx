"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import type { Transaction } from "@/types/transaction"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TransactionListProps {
  transactions: Transaction[]
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
  showActions?: boolean
}

export function TransactionList({ transactions, onEdit, onDelete, showActions = false }: TransactionListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatAmount = (amount: number) => {
    const isPositive = amount >= 0
    return {
      value: `$${Math.abs(amount).toFixed(2)}`,
      isPositive,
    }
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No transactions to display</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const { value, isPositive } = formatAmount(transaction.amount)

            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate" title={transaction.description}>
                    {transaction.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {isPositive ? "+" : "-"}
                    {value}
                  </span>
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit transaction</span>
                        </Button>
                      )}
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete transaction</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this transaction? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(transaction.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
