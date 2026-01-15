"use client"

import { useState } from "react"
import { useCreateApiKey } from "@/lib/hooks/use-api-keys"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Copy, Check } from "lucide-react"

export function CreateApiKeyDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const createApiKey = useCreateApiKey()

  const handleCreate = async () => {
    if (!name.trim()) return

    try {
      const key = await createApiKey.mutateAsync(name)
      setCreatedKey(key.key_prefix) // In a real app, this would be the full key
      setName("")
    } catch (error) {
      console.error("Failed to create API key:", error)
    }
  }

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setCreatedKey(null)
    setName("")
    setCopied(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Generate a new API key for accessing the FeatureFlag API</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  placeholder="Production Server"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Choose a descriptive name to identify this key</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!name.trim() || createApiKey.isPending}>
                {createApiKey.isPending ? "Creating..." : "Create Key"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                Make sure to copy your API key now. You will not be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-4">
                <code className="flex-1 font-mono text-sm break-all">{createdKey}</code>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                Important: Store this key securely. It will not be shown again.
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
