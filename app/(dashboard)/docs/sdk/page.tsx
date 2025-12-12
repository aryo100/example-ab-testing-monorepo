import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SdkDocsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SDK Integration</h1>
          <p className="text-muted-foreground">Learn how to integrate FeatureFlag SDK into your application</p>
        </div>

        <Tabs defaultValue="javascript" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="go">Go</TabsTrigger>
          </TabsList>

          <TabsContent value="javascript" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>Install the JavaScript SDK via npm or yarn</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="text-sm font-mono">npm install @featureflag/sdk</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Usage</CardTitle>
                <CardDescription>Initialize the SDK and evaluate feature flags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className="mb-2">Initialize Client</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`import { FeatureFlagClient } from '@featureflag/sdk';

const client = new FeatureFlagClient({
  apiKey: 'your_api_key_here',
  apiUrl: 'https://api.featureflag.com'
});

await client.initialize();`}</code>
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Boolean Flags</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`// Check if a feature is enabled
const isEnabled = await client.isEnabled('new-feature', {
  userId: 'user-123'
});

if (isEnabled) {
  // Show new feature
} else {
  // Show old feature
}`}</code>
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Variant Flags</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`// Get variant for A/B testing
const variant = await client.getVariant('button-color', {
  userId: 'user-123'
});

switch(variant) {
  case 'blue':
    // Show blue button
    break;
  case 'green':
    // Show green button
    break;
  default:
    // Show default button
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Features</CardTitle>
                <CardDescription>Context attributes and custom properties</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="text-sm font-mono">{`// Include user context for targeting
const context = {
  userId: 'user-123',
  email: 'user@example.com',
  plan: 'premium',
  country: 'US'
};

const isEnabled = await client.isEnabled('premium-feature', context);`}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="python" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>Install the Python SDK via pip</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="text-sm font-mono">pip install featureflag-sdk</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Usage</CardTitle>
                <CardDescription>Initialize the SDK and evaluate feature flags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className="mb-2">Initialize Client</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`from featureflag import Client

client = Client(
    api_key="your_api_key_here",
    api_url="https://api.featureflag.com"
)

client.initialize()`}</code>
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Boolean Flags</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`# Check if a feature is enabled
is_enabled = client.is_enabled(
    "new-feature",
    context={"user_id": "user-123"}
)

if is_enabled:
    # Show new feature
    pass
else:
    # Show old feature
    pass`}</code>
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Variant Flags</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`# Get variant for A/B testing
variant = client.get_variant(
    "button-color",
    context={"user_id": "user-123"}
)

if variant == "blue":
    # Show blue button
    pass
elif variant == "green":
    # Show green button
    pass`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="go" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>Install the Go SDK via go get</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                  <code className="text-sm font-mono">go get github.com/featureflag/sdk-go</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Usage</CardTitle>
                <CardDescription>Initialize the SDK and evaluate feature flags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className="mb-2">Initialize Client</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`package main

import (
    "github.com/featureflag/sdk-go"
)

func main() {
    client := featureflag.NewClient(
        featureflag.Config{
            APIKey: "your_api_key_here",
            APIURL: "https://api.featureflag.com",
        },
    )
    
    client.Initialize()
    defer client.Close()
}`}</code>
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Boolean Flags</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`// Check if a feature is enabled
context := map[string]interface{}{
    "userId": "user-123",
}

isEnabled, err := client.IsEnabled("new-feature", context)
if err != nil {
    log.Fatal(err)
}

if isEnabled {
    // Show new feature
} else {
    // Show old feature
}`}</code>
                  </pre>
                </div>

                <div>
                  <Badge className="mb-2">Variant Flags</Badge>
                  <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                    <code className="text-sm font-mono">{`// Get variant for A/B testing
variant, err := client.GetVariant("button-color", context)
if err != nil {
    log.Fatal(err)
}

switch variant {
case "blue":
    // Show blue button
case "green":
    // Show green button
default:
    // Show default button
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
            <CardDescription>Tips for using feature flags effectively</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">Initialize once:</strong> Create a single SDK client instance and
                  reuse it across your application
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">Handle errors:</strong> Always implement fallback values when flag
                  evaluation fails
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">Use context:</strong> Include relevant user attributes for better
                  targeting and analytics
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong className="text-foreground">Clean up:</strong> Remove flags from your code once features are
                  fully rolled out
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
