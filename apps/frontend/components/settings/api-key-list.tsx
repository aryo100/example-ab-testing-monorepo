"use client"

import { useState } from "react"
import { useApiKeys, useDeleteApiKey } from "@/lib/hooks/use-api-keys"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Copy, Check } from "lucide-react"
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

export function ApiKeyList() {
  const { data, isLoading } = useApiKeys()
  const apiKeys = Array.isArray(data) ? data : []
  const deleteApiKey = useDeleteApiKey()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (deleteId) {
      await deleteApiKey.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (isLoading) {
    return <div className="text-muted-foreground">Loading API keys...</div>
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Key Prefix</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No API keys found. Create your first key to get started.
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-sm font-mono">{key.key_prefix}...</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(key.key_prefix, key.id)}
                      >
                        {copiedId === key.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(key.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.last_used ? (
                      formatDistanceToNow(new Date(key.last_used), { addSuffix: true })
                    ) : (
                      <Badge variant="secondary">Never</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(key.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? Applications using this key will no longer be able to access
              the API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
