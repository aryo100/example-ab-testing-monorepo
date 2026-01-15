import { Injectable } from '@nestjs/common';
import * as murmurhash from 'murmurhash';

@Injectable()
export class HashingService {
  /**
   * Generate a consistent bucket (0-99) for a given client and flag
   * Uses MurmurHash3 for fast, consistent hashing
   *
   * @param clientId - The client/user identifier
   * @param flagKey - The feature flag key
   * @returns A number between 0 and 99
   */
  getBucket(clientId: string, flagKey: string): number {
    const seed = 0; // Consistent seed for reproducibility
    const input = `${clientId}:${flagKey}`;
    const hash = murmurhash.v3(input, seed);
    
    // Get a value between 0 and 99
    return Math.abs(hash) % 100;
  }

  /**
   * Generate a consistent hash value for any string
   *
   * @param input - Input string to hash
   * @returns A 32-bit unsigned integer hash
   */
  hash(input: string): number {
    return murmurhash.v3(input, 0);
  }

  /**
   * Check if a client is in a given percentage rollout
   *
   * @param clientId - The client/user identifier
   * @param flagKey - The feature flag key
   * @param percentage - The rollout percentage (0-100)
   * @returns Whether the client is in the rollout
   */
  isInRollout(clientId: string, flagKey: string, percentage: number): boolean {
    const bucket = this.getBucket(clientId, flagKey);
    return bucket < percentage;
  }

  /**
   * Select a variant based on weighted distribution
   *
   * @param clientId - The client/user identifier
   * @param flagKey - The feature flag key
   * @param variants - Array of variants with weights
   * @returns The selected variant key, or null if no variants
   */
  selectVariant(
    clientId: string,
    flagKey: string,
    variants: { key: string; weight: number }[],
  ): string | null {
    if (!variants || variants.length === 0) {
      return null;
    }

    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight === 0) {
      return null;
    }

    const bucket = this.getBucket(clientId, flagKey);
    const normalizedBucket = (bucket / 100) * totalWeight;

    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (normalizedBucket < cumulative) {
        return variant.key;
      }
    }

    // Fallback to last variant
    return variants[variants.length - 1].key;
  }
}


