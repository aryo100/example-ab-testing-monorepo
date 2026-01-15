import type { ApiKey } from "../types"

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Production API Key",
    key: "ffx_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "key-2",
    name: "Development API Key",
    key: "ffx_dev_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "key-3",
    name: "Testing API Key",
    key: "ffx_test_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const isDemoMode = () => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("demoMode") === "true"
}

export const apiKeysApi = {
  async getApiKeys(): Promise<ApiKey[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...MOCK_API_KEYS]
  },

  async createApiKey(name: string): Promise<ApiKey> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newKey: ApiKey = {
      id: `key-${Math.random().toString(36).substr(2, 9)}`,
      name,
      key: `ffx_${name.toLowerCase().replace(/\s+/g, "_")}_${Math.random().toString(36).substr(2, 32)}`,
      created_at: new Date().toISOString(),
    }
    MOCK_API_KEYS.push(newKey)
    return { ...newKey }
  },

  async deleteApiKey(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_API_KEYS.findIndex((k) => k.id === id)
    if (index !== -1) {
      MOCK_API_KEYS.splice(index, 1)
    }
  },
}
