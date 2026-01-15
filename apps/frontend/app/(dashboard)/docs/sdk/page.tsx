"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

// ============================================
// Code Block Component with Copy
// ============================================

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="rounded-lg bg-zinc-950 p-4 overflow-x-auto border border-border">
        <code className="text-sm font-mono text-zinc-100">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-zinc-400 hover:text-zinc-100"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

// ============================================
// SDK Documentation Page
// ============================================

export default function SdkDocsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SDK & API Integration</h1>
          <p className="text-muted-foreground mt-2">
            Learn how to integrate FlagRoll into your application using our REST API or client SDKs
          </p>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with FlagRoll in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  1
                </div>
                <h4 className="font-medium">Get API Key</h4>
                <p className="text-sm text-muted-foreground">
                  Create an API key from the Settings page
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  2
                </div>
                <h4 className="font-medium">Create Flag</h4>
                <p className="text-sm text-muted-foreground">
                  Create your first feature flag in the dashboard
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                  3
                </div>
                <h4 className="font-medium">Integrate</h4>
                <p className="text-sm text-muted-foreground">
                  Use the API or SDK to evaluate flags
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Tabs defaultValue="rest" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rest">REST API</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="nodejs">Node.js</TabsTrigger>
          </TabsList>

          {/* REST API Tab */}
          <TabsContent value="rest" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>All API requests require an API key</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`# Include your API key in the header
curl -X GET "${apiUrl}/api/v1/client/decide" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json"`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">POST</Badge>
                  <CardTitle className="text-lg">/api/v1/client/decide</CardTitle>
                </div>
                <CardDescription>Evaluate a feature flag for a user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <CodeBlock
                    code={`{
  "flagKey": "new-checkout-flow",
  "userId": "user-123",
  "context": {
    "email": "user@example.com",
    "plan": "premium",
    "country": "US"
  }
}`}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Response</h4>
                  <CodeBlock
                    code={`{
  "flagKey": "new-checkout-flow",
  "enabled": true,
  "variant": "variant-a",
  "payload": {
    "buttonColor": "blue",
    "showBanner": true
  }
}`}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">cURL Example</h4>
                  <CodeBlock
                    code={`curl -X POST "${apiUrl}/api/v1/client/decide" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flagKey": "new-checkout-flow",
    "userId": "user-123",
    "context": {
      "plan": "premium"
    }
  }'`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">POST</Badge>
                  <CardTitle className="text-lg">/api/v1/events/exposure</CardTitle>
                </div>
                <CardDescription>Track when a user is exposed to a feature flag</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <CodeBlock
                    code={`{
  "flagKey": "new-checkout-flow",
  "userId": "user-123",
  "variantKey": "variant-a",
  "timestamp": "2024-01-15T10:30:00Z",
  "context": {
    "page": "/checkout",
    "sessionId": "sess-456"
  }
}`}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">cURL Example</h4>
                  <CodeBlock
                    code={`curl -X POST "${apiUrl}/api/v1/events/exposure" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flagKey": "new-checkout-flow",
    "userId": "user-123",
    "variantKey": "variant-a"
  }'`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600">POST</Badge>
                  <CardTitle className="text-lg">/api/v1/events/conversion</CardTitle>
                </div>
                <CardDescription>Track conversion events for analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Request Body</h4>
                  <CodeBlock
                    code={`{
  "flagKey": "new-checkout-flow",
  "eventName": "purchase_completed",
  "userId": "user-123",
  "value": 99.99,
  "timestamp": "2024-01-15T10:35:00Z",
  "context": {
    "orderId": "order-789",
    "items": 3
  }
}`}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">cURL Example</h4>
                  <CodeBlock
                    code={`curl -X POST "${apiUrl}/api/v1/events/conversion" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flagKey": "new-checkout-flow",
    "eventName": "purchase_completed",
    "userId": "user-123",
    "value": 99.99
  }'`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JavaScript Tab */}
          <TabsContent value="javascript" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>Install the JavaScript SDK via npm or yarn</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`npm install @flagroll/sdk`} />
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
                  <CodeBlock
                    code={`import { FlagRollClient } from '@flagroll/sdk';

const client = new FlagRollClient({
  apiKey: 'your_api_key_here',
  apiUrl: '${apiUrl}'
});

// Initialize the client
await client.initialize();`}
                  />
                </div>

                <div>
                  <Badge className="mb-2">Evaluate Flag</Badge>
                  <CodeBlock
                    code={`// Check if a feature is enabled
const result = await client.decide('new-checkout-flow', {
  userId: 'user-123',
  context: {
    plan: 'premium',
    country: 'US'
  }
});

if (result.enabled) {
  console.log('Show new checkout flow');
  console.log('Variant:', result.variant);
  console.log('Payload:', result.payload);
} else {
  console.log('Show default checkout flow');
}`}
                  />
                </div>

                <div>
                  <Badge className="mb-2">Track Events</Badge>
                  <CodeBlock
                    code={`// Track exposure event
await client.trackExposure('new-checkout-flow', {
  userId: 'user-123',
  variantKey: 'variant-a'
});

// Track conversion event
await client.trackConversion('new-checkout-flow', {
  userId: 'user-123',
  eventName: 'purchase_completed',
  value: 99.99
});`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* React Tab */}
          <TabsContent value="react" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>Install the React SDK</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`npm install @flagroll/react`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Setup Provider</CardTitle>
                <CardDescription>Wrap your app with the FlagRoll provider</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// app/layout.tsx or _app.tsx
import { FlagRollProvider } from '@flagroll/react';

export default function RootLayout({ children }) {
  return (
    <FlagRollProvider
      apiKey="your_api_key_here"
      apiUrl="${apiUrl}"
      user={{
        userId: 'user-123',
        email: 'user@example.com',
        plan: 'premium'
      }}
    >
      {children}
    </FlagRollProvider>
  );
}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Using Hooks</CardTitle>
                <CardDescription>Use the feature flag hooks in your components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className="mb-2">useFlag Hook</Badge>
                  <CodeBlock
                    code={`import { useFlag } from '@flagroll/react';

function CheckoutPage() {
  const { enabled, variant, loading, error } = useFlag('new-checkout-flow');

  if (loading) return <Loading />;
  if (error) return <Error />;

  return enabled ? (
    <NewCheckoutFlow variant={variant} />
  ) : (
    <DefaultCheckoutFlow />
  );
}`}
                  />
                </div>

                <div>
                  <Badge className="mb-2">Feature Component</Badge>
                  <CodeBlock
                    code={`import { Feature } from '@flagroll/react';

function App() {
  return (
    <Feature
      flag="new-checkout-flow"
      fallback={<DefaultCheckoutFlow />}
    >
      <NewCheckoutFlow />
    </Feature>
  );
}`}
                  />
                </div>

                <div>
                  <Badge className="mb-2">Track Conversion</Badge>
                  <CodeBlock
                    code={`import { useTrackConversion } from '@flagroll/react';

function PurchaseButton() {
  const trackConversion = useTrackConversion();

  const handlePurchase = async () => {
    // ... purchase logic
    
    await trackConversion('new-checkout-flow', {
      eventName: 'purchase_completed',
      value: 99.99
    });
  };

  return <button onClick={handlePurchase}>Complete Purchase</button>;
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Node.js Tab */}
          <TabsContent value="nodejs" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
                <CardDescription>Install the Node.js SDK</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`npm install @flagroll/node`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Server-side Usage</CardTitle>
                <CardDescription>Use FlagRoll in your Node.js backend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className="mb-2">Initialize Client</Badge>
                  <CodeBlock
                    code={`const { FlagRollClient } = require('@flagroll/node');

const client = new FlagRollClient({
  apiKey: process.env.FLAGROLL_API_KEY,
  apiUrl: '${apiUrl}'
});

// Initialize once at startup
await client.initialize();`}
                  />
                </div>

                <div>
                  <Badge className="mb-2">Express Middleware</Badge>
                  <CodeBlock
                    code={`const express = require('express');
const app = express();

// Middleware to attach flag client to request
app.use((req, res, next) => {
  req.flagroll = client;
  next();
});

// Use in route handler
app.get('/checkout', async (req, res) => {
  const userId = req.user.id;
  
  const { enabled, variant } = await req.flagroll.decide(
    'new-checkout-flow',
    {
      userId,
      context: {
        plan: req.user.plan,
        country: req.user.country
      }
    }
  );

  if (enabled) {
    res.render('checkout-new', { variant });
  } else {
    res.render('checkout-default');
  }
});`}
                  />
                </div>

                <div>
                  <Badge className="mb-2">Track Server Events</Badge>
                  <CodeBlock
                    code={`// Track exposure on page load
app.get('/checkout', async (req, res) => {
  const result = await client.decide('new-checkout-flow', {
    userId: req.user.id
  });

  // Track exposure
  await client.trackExposure('new-checkout-flow', {
    userId: req.user.id,
    variantKey: result.variant
  });

  res.render('checkout', { result });
});

// Track conversion on purchase
app.post('/purchase', async (req, res) => {
  const { orderId, total } = req.body;

  // ... process purchase

  // Track conversion
  await client.trackConversion('new-checkout-flow', {
    userId: req.user.id,
    eventName: 'purchase_completed',
    value: total,
    context: { orderId }
  });

  res.json({ success: true });
});`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
            <CardDescription>Tips for using feature flags effectively</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Initialize once:</strong>{" "}
                  <span className="text-muted-foreground">
                    Create a single SDK client instance and reuse it across your application
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Handle errors gracefully:</strong>{" "}
                  <span className="text-muted-foreground">
                    Always implement fallback values when flag evaluation fails
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Use context attributes:</strong>{" "}
                  <span className="text-muted-foreground">
                    Include relevant user attributes for better targeting and analytics
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Track conversions:</strong>{" "}
                  <span className="text-muted-foreground">
                    Always track conversion events to measure the impact of your experiments
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Clean up old flags:</strong>{" "}
                  <span className="text-muted-foreground">
                    Remove flags from your code once features are fully rolled out
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span>
                  <strong className="text-foreground">Use meaningful flag keys:</strong>{" "}
                  <span className="text-muted-foreground">
                    Use descriptive, lowercase, kebab-case keys (e.g., new-checkout-flow)
                  </span>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* API Endpoints Reference */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints Reference</CardTitle>
            <CardDescription>Complete list of available API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left font-medium">Method</th>
                    <th className="py-3 px-4 text-left font-medium">Endpoint</th>
                    <th className="py-3 px-4 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4"><Badge className="bg-green-600">POST</Badge></td>
                    <td className="py-3 px-4 font-mono text-xs">/api/v1/client/decide</td>
                    <td className="py-3 px-4 text-muted-foreground">Evaluate a feature flag</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><Badge className="bg-green-600">POST</Badge></td>
                    <td className="py-3 px-4 font-mono text-xs">/api/v1/events/exposure</td>
                    <td className="py-3 px-4 text-muted-foreground">Track exposure event</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><Badge className="bg-green-600">POST</Badge></td>
                    <td className="py-3 px-4 font-mono text-xs">/api/v1/events/conversion</td>
                    <td className="py-3 px-4 text-muted-foreground">Track conversion event</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><Badge className="bg-blue-600">GET</Badge></td>
                    <td className="py-3 px-4 font-mono text-xs">/api/v1/flags</td>
                    <td className="py-3 px-4 text-muted-foreground">List all flags</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><Badge className="bg-blue-600">GET</Badge></td>
                    <td className="py-3 px-4 font-mono text-xs">/api/v1/flags/:id</td>
                    <td className="py-3 px-4 text-muted-foreground">Get flag by ID</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><Badge className="bg-blue-600">GET</Badge></td>
                    <td className="py-3 px-4 font-mono text-xs">/api/v1/analytics/flags/:id</td>
                    <td className="py-3 px-4 text-muted-foreground">Get flag analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
