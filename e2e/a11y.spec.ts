import { readFileSync } from 'node:fs';
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const snapshot = JSON.parse(readFileSync('src/data/snapshot.json', 'utf8'));
const sample = snapshot.items[0];

const routes = [
  '/',
  '/items',
  `/items/${sample.id}`,
  '/search',
  '/map',
  '/opt-out',
  '/subscribe',
  '/contact',
  '/feedback',
  '/help',
  '/login',
];

// Automated gate: WCAG 2.2 A/AA + best practice. AAA is a manual human
// review on top of this (see docs/a11y.md) because axe has no AAA rules.
test.describe('a11y audit (WCAG 2.2 A/AA + best practice)', () => {
  for (const route of routes) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
