"use client"

import { useState } from "react"
import Link from "next/link"
import { useDeleteExperiment } from "@/lib/hooks/use-experiments"
import type { Experiment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Play, Pause, CheckCircle, BarChart2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"

interface ExperimentTableProps {
  experiments: Experiment[]
}

export function ExperimentTable({ experiments }: ExperimentTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteExperiment = useDeleteExperiment()

  const handleDelete = async () => {
    if (deleteId) {
      await deleteExperiment.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  const getStatusBadge = (status: Experiment["status"]) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-green-500 text-white">
            <Play className="mr-1 h-3 w-3" />
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="outline">
            <Pause className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        )
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Experiment Name</TableHead>
              <TableHead>Flag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No experiments found. Create your first experiment to get started.
                </TableCell>
              </TableRow>
            ) : (
              experiments.map((experiment) => (
                <TableRow key={experiment.id}>
                  <TableCell className="font-medium">{experiment.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {experiment.flag?.key || experiment.flagId}
                  </TableCell>
                  <TableCell>{getStatusBadge(experiment.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {experiment.startDate
                      ? new Date(experiment.startDate).toLocaleDateString()
                      : "Not set"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(experiment.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/experiments/${experiment.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/analytics/experiments/${experiment.id}`}
                            className="flex items-center"
                          >
                            <BarChart2 className="mr-2 h-4 w-4" />
                            Analytics
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(experiment.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experiment</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the experiment and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
