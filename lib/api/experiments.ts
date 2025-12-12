import type { Experiment, CreateExperimentDto } from "../types"

const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: "exp-1",
    name: "Homepage Hero Test",
    description: "Testing different hero section layouts for conversion",
    flag_id: "3",
    status: "running",
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "exp-2",
    name: "Pricing Page Optimization",
    description: "A/B test for pricing table layout",
    flag_id: "2",
    status: "draft",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "exp-3",
    name: "Checkout Flow Improvement",
    description: "Testing simplified checkout vs multi-step",
    flag_id: "3",
    status: "completed",
    start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "exp-4",
    name: "Mobile Navigation Test",
    description: "Testing hamburger menu vs bottom navigation",
    flag_id: "1",
    status: "paused",
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const experimentsApi = {
  async getExperiments(): Promise<Experiment[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [...MOCK_EXPERIMENTS]
  },

  async getExperiment(id: string): Promise<Experiment> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const experiment = MOCK_EXPERIMENTS.find((e) => e.id === id)
    if (!experiment) throw new Error("Experiment not found")
    return { ...experiment }
  },

  async createExperiment(data: CreateExperimentDto): Promise<Experiment> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newExperiment: Experiment = {
      id: `exp-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    MOCK_EXPERIMENTS.push(newExperiment)
    return { ...newExperiment }
  },

  async updateExperiment(id: string, data: Partial<CreateExperimentDto>): Promise<Experiment> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_EXPERIMENTS.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Experiment not found")

    MOCK_EXPERIMENTS[index] = {
      ...MOCK_EXPERIMENTS[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return { ...MOCK_EXPERIMENTS[index] }
  },

  async deleteExperiment(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_EXPERIMENTS.findIndex((e) => e.id === id)
    if (index !== -1) {
      MOCK_EXPERIMENTS.splice(index, 1)
    }
  },

  async startExperiment(id: string): Promise<Experiment> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_EXPERIMENTS.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Experiment not found")

    MOCK_EXPERIMENTS[index] = {
      ...MOCK_EXPERIMENTS[index],
      status: "running",
      start_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return { ...MOCK_EXPERIMENTS[index] }
  },

  async pauseExperiment(id: string): Promise<Experiment> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_EXPERIMENTS.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Experiment not found")

    MOCK_EXPERIMENTS[index] = {
      ...MOCK_EXPERIMENTS[index],
      status: "paused",
      updated_at: new Date().toISOString(),
    }
    return { ...MOCK_EXPERIMENTS[index] }
  },

  async completeExperiment(id: string): Promise<Experiment> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_EXPERIMENTS.findIndex((e) => e.id === id)
    if (index === -1) throw new Error("Experiment not found")

    MOCK_EXPERIMENTS[index] = {
      ...MOCK_EXPERIMENTS[index],
      status: "completed",
      end_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return { ...MOCK_EXPERIMENTS[index] }
  },
}
