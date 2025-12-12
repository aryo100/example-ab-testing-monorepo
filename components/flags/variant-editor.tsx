"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { flagsApi } from "@/lib/api/flags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
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

interface VariantEditorProps {
  flagId: string
}

export function VariantEditor({ flagId }: VariantEditorProps) {
  const queryClient = useQueryClient()
  const [newVariantKey, setNewVariantKey] = useState("")
  const [newVariantWeight, setNewVariantWeight] = useState("0")
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null)

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["variants", flagId],
    queryFn: () => flagsApi.getVariants(flagId),
  })

  const createVariant = useMutation({
    mutationFn: (data: { key: string; weight: number }) => flagsApi.createVariant(flagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", flagId] })
      setNewVariantKey("")
      setNewVariantWeight("0")
    },
  })

  const updateVariant = useMutation({
    mutationFn: ({ variantId, weight }: { variantId: string; weight: number }) =>
      flagsApi.updateVariant(flagId, variantId, { weight }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", flagId] })
    },
  })

  const deleteVariant = useMutation({
    mutationFn: (variantId: string) => flagsApi.deleteVariant(flagId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants", flagId] })
      setDeleteVariantId(null)
    },
  })

  const handleAddVariant = () => {
    if (newVariantKey && !isNaN(Number.parseFloat(newVariantWeight))) {
      createVariant.mutate({
        key: newVariantKey,
        weight: Number.parseFloat(newVariantWeight),
      })
    }
  }

  const handleWeightChange = (variantId: string, weight: string) => {
    const numWeight = Number.parseFloat(weight)
    if (!isNaN(numWeight)) {
      updateVariant.mutate({ variantId, weight: numWeight })
    }
  }

  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)

  if (isLoading) {
    return <div className="text-muted-foreground">Loading variants...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Variant Configuration</CardTitle>
          <CardDescription>
            Define variants and their traffic distribution. Total weight should equal 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {variants.map((variant) => (
              <div key={variant.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium">{variant.key}</Label>
                </div>
                <div className="w-32">
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={variant.weight}
                      onChange={(e) => handleWeightChange(variant.id, e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteVariantId(variant.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {totalWeight !== 100 && variants.length > 0 && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              Warning: Total weight is {totalWeight.toFixed(1)}%. It should equal 100%.
            </div>
          )}

          <div className="space-y-4 border-t border-border pt-4">
            <Label>Add New Variant</Label>
            <div className="flex gap-3">
              <Input
                placeholder="variant-key"
                value={newVariantKey}
                onChange={(e) => setNewVariantKey(e.target.value)}
                className="flex-1 font-mono"
              />
              <div className="relative w-32">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={newVariantWeight}
                  onChange={(e) => setNewVariantWeight(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
              </div>
              <Button onClick={handleAddVariant} disabled={!newVariantKey || createVariant.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteVariantId} onOpenChange={() => setDeleteVariantId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVariantId && deleteVariant.mutate(deleteVariantId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
