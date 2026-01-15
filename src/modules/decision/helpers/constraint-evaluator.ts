import { Injectable } from '@nestjs/common';
import { ClientContext } from '../dto/decision-request.dto';

interface ConstraintRule {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
  value: unknown;
}

interface Constraints {
  rules?: ConstraintRule[];
  operator?: 'AND' | 'OR';
}

@Injectable()
export class ConstraintEvaluator {
  /**
   * Evaluate constraints against client context
   *
   * Example constraints:
   * {
   *   "rules": [
   *     { "field": "country", "operator": "in", "value": ["ID", "SG", "MY"] },
   *     { "field": "plan", "operator": "in", "value": ["pro", "enterprise"] },
   *     { "field": "appVersion", "operator": "gte", "value": "2.3.0" }
   *   ],
   *   "operator": "AND"
   * }
   *
   * @param constraints - The constraint configuration
   * @param context - The client context to evaluate against
   * @returns Whether all constraints are satisfied
   */
  evaluate(constraints: Record<string, unknown>, context: ClientContext): boolean {
    if (!constraints || !constraints.rules) {
      return true; // No constraints means always pass
    }

    const typedConstraints = constraints as Constraints;
    const rules = typedConstraints.rules || [];
    const combineOperator = typedConstraints.operator || 'AND';

    if (rules.length === 0) {
      return true;
    }

    const results = rules.map((rule) => this.evaluateRule(rule, context));

    if (combineOperator === 'AND') {
      return results.every((r) => r);
    } else {
      return results.some((r) => r);
    }
  }

  /**
   * Evaluate a single constraint rule
   */
  private evaluateRule(rule: ConstraintRule, context: ClientContext): boolean {
    const { field, operator, value } = rule;
    const contextValue = context[field];

    // If context doesn't have the field, the rule fails (unless checking for absence)
    if (contextValue === undefined) {
      return operator === 'neq' || operator === 'nin';
    }

    switch (operator) {
      case 'eq':
        return contextValue === value;

      case 'neq':
        return contextValue !== value;

      case 'in':
        if (Array.isArray(value)) {
          return value.includes(contextValue);
        }
        return false;

      case 'nin':
        if (Array.isArray(value)) {
          return !value.includes(contextValue);
        }
        return true;

      case 'gt':
        return this.compareVersions(contextValue, value) > 0;

      case 'gte':
        return this.compareVersions(contextValue, value) >= 0;

      case 'lt':
        return this.compareVersions(contextValue, value) < 0;

      case 'lte':
        return this.compareVersions(contextValue, value) <= 0;

      case 'contains':
        if (typeof contextValue === 'string' && typeof value === 'string') {
          return contextValue.includes(value);
        }
        if (Array.isArray(contextValue)) {
          return contextValue.includes(value);
        }
        return false;

      case 'regex':
        if (typeof contextValue === 'string' && typeof value === 'string') {
          try {
            const regex = new RegExp(value);
            return regex.test(contextValue);
          } catch {
            return false;
          }
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Compare two values, supporting semantic version comparison
   * For version strings like "2.3.0", compares as versions
   * For numbers, compares numerically
   * For strings, compares lexicographically
   */
  private compareVersions(a: unknown, b: unknown): number {
    // Handle null/undefined
    if (a === null || a === undefined) return -1;
    if (b === null || b === undefined) return 1;

    // Try numeric comparison first
    const numA = Number(a);
    const numB = Number(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    // Try semantic version comparison
    const strA = String(a);
    const strB = String(b);

    if (this.isSemanticVersion(strA) && this.isSemanticVersion(strB)) {
      return this.compareSemanticVersions(strA, strB);
    }

    // Fall back to string comparison
    return strA.localeCompare(strB);
  }

  private isSemanticVersion(str: string): boolean {
    return /^\d+(\.\d+)*$/.test(str);
  }

  private compareSemanticVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    const maxLength = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < maxLength; i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;

      if (partA > partB) return 1;
      if (partA < partB) return -1;
    }

    return 0;
  }
}


