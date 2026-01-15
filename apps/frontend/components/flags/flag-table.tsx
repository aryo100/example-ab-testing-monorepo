"use client"

import { useState } from "react"
import Link from "next/link"
import { useDeleteFlag, useToggleFlag } from "@/lib/hooks/use-flags"
import type { FeatureFlag } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, BarChart3, Settings, Archive } from "lucide-react"
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

interface FlagTableProps {
  flags: FeatureFlag[]
}

export function FlagTable({ flags }: FlagTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteFlag = useDeleteFlag()
  const toggleFlag = useToggleFlag()

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFlag.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  const handleToggle = (id: string) => {
    toggleFlag.mutate(id)
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "boolean":
        return "default"
      case "percentage":
        return "secondary"
      case "variant":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16">Status</TableHead>
              <TableHead>Flag Key</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No feature flags found. Create your first flag to get started.
                </TableCell>
              </TableRow>
            ) : (
              flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        flag.enabled ? "bg-green-500" : "bg-muted-foreground"
                      }`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{flag.key}</TableCell>
                  <TableCell className="font-medium">{flag.name}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(flag.type)}>{flag.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag.id)}
                      disabled={toggleFlag.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(flag.updatedAt), { addSuffix: true })}
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
                          <Link href={`/flags/${flag.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/analytics/flags/${flag.id}`} className="flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </Link>
                        </DropdownMenuItem>
                        {flag.type === "variant" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/flags/${flag.id}/variants`} className="flex items-center">
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Variants
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(flag.id)}
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
            <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the feature flag and all
              associated data including variants and analytics.
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
