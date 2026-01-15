"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ApiKeyList } from "@/components/settings/api-key-list"
import { CreateApiKeyDialog } from "@/components/settings/create-api-key-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApiKeysPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">Manage API keys for programmatic access</p>
          </div>
          <CreateApiKeyDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Use API keys to authenticate your applications with the FeatureFlag API</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              API keys provide secure access to the FeatureFlag API. Include your key in the Authorization header of all
              API requests. Keep your keys secure and rotate them regularly.
            </p>
          </CardContent>
        </Card>

        <ApiKeyList />
      </div>
    </DashboardLayout>
  )
}
