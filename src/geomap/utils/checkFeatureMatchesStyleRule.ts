import { type FeatureLike } from 'ol/Feature';

import { type FeatureRuleConfig } from '../types';

function compareValues(value: unknown, operation: string, expected: unknown) {
  const text = (item: unknown) => (item == null ? '' : String(item));
  const num = (item: unknown) => Number(item);
  switch (operation) {
    case 'eq':
      return value === expected || text(value) === text(expected);
    case 'neq':
      return value !== expected && text(value) !== text(expected);
    case 'gt':
      return num(value) > num(expected);
    case 'gte':
      return num(value) >= num(expected);
    case 'lt':
      return num(value) < num(expected);
    case 'lte':
      return num(value) <= num(expected);
    case 'contains':
      return text(value).includes(text(expected));
    default:
      return false;
  }
}

/**
 * Check whether feature has property value that matches rule
 * @param rule - style rule with an operation, property, and value
 * @param feature - feature with properties and values
 * @returns boolean
 */
export const checkFeatureMatchesStyleRule = (rule: FeatureRuleConfig, feature: FeatureLike) => {
  const val = feature.get(rule.property);
  return compareValues(val, rule.operation, rule.value);
};
