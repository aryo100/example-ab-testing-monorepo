import type { FeatureFlag, CreateFlagDto, UpdateFlagDto, FlagVariant, CreateVariantDto } from "../types"

const MOCK_FLAGS: FeatureFlag[] = [
  {
    id: "1",
    key: "new_dashboard",
    name: "New Dashboard",
    description: "Enable the redesigned dashboard interface",
    type: "boolean",
    enabled: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    key: "beta_features",
    name: "Beta Features",
    description: "Gradual rollout of beta features to users",
    type: "percentage",
    enabled: true,
    percentage: 25,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    key: "checkout_flow",
    name: "Checkout Flow",
    description: "A/B test different checkout experiences",
    type: "variant",
    enabled: true,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    key: "dark_mode",
    name: "Dark Mode",
    description: "Enable dark mode theme",
    type: "boolean",
    enabled: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    key: "premium_features",
    name: "Premium Features",
    description: "Enable premium tier features",
    type: "boolean",
    enabled: true,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const MOCK_VARIANTS: Record<string, FlagVariant[]> = {
  "3": [
    {
      id: "v1",
      flag_id: "3",
      key: "control",
      name: "Control",
      description: "Original checkout flow",
      weight: 50,
      created_at: new Date().toISOString(),
    },
    {
      id: "v2",
      flag_id: "3",
      key: "variant_a",
      name: "Variant A",
      description: "Simplified one-page checkout",
      weight: 30,
      created_at: new Date().toISOString(),
    },
    {
      id: "v3",
      flag_id: "3",
      key: "variant_b",
      name: "Variant B",
      description: "Express checkout option",
      weight: 20,
      created_at: new Date().toISOString(),
    },
  ],
}

export const flagsApi = {
  async getFlags(): Promise<FeatureFlag[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...MOCK_FLAGS]
  },

  async getFlag(id: string): Promise<FeatureFlag> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const flag = MOCK_FLAGS.find((f) => f.id === id)
    if (!flag) throw new Error("Flag not found")
    return { ...flag }
  },

  async createFlag(data: CreateFlagDto): Promise<FeatureFlag> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newFlag: FeatureFlag = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    MOCK_FLAGS.push(newFlag)
    return { ...newFlag }
  },

  async updateFlag(id: string, data: UpdateFlagDto): Promise<FeatureFlag> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_FLAGS.findIndex((f) => f.id === id)
    if (index === -1) throw new Error("Flag not found")

    MOCK_FLAGS[index] = {
      ...MOCK_FLAGS[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return { ...MOCK_FLAGS[index] }
  },

  async deleteFlag(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_FLAGS.findIndex((f) => f.id === id)
    if (index !== -1) {
      MOCK_FLAGS.splice(index, 1)
    }
  },

  // Variants
  async getVariants(flagId: string): Promise<FlagVariant[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_VARIANTS[flagId] || []
  },

  async createVariant(flagId: string, data: CreateVariantDto): Promise<FlagVariant> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newVariant: FlagVariant = {
      id: Math.random().toString(36).substr(2, 9),
      flag_id: flagId,
      ...data,
      created_at: new Date().toISOString(),
    }

    if (!MOCK_VARIANTS[flagId]) {
      MOCK_VARIANTS[flagId] = []
    }
    MOCK_VARIANTS[flagId].push(newVariant)
    return { ...newVariant }
  },

  async updateVariant(flagId: string, variantId: string, data: Partial<CreateVariantDto>): Promise<FlagVariant> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const variants = MOCK_VARIANTS[flagId] || []
    const index = variants.findIndex((v) => v.id === variantId)

    if (index === -1) throw new Error("Variant not found")

    variants[index] = {
      ...variants[index],
      ...data,
    }
    return { ...variants[index] }
  },

  async deleteVariant(flagId: string, variantId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const variants = MOCK_VARIANTS[flagId]
    if (variants) {
      const index = variants.findIndex((v) => v.id === variantId)
      if (index !== -1) {
        variants.splice(index, 1)
      }
    }
  },
}
