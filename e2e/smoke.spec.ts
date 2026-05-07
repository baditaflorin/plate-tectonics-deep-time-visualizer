import { expect, test } from '@playwright/test';

test('loads the published map shell and scrubs to the Himalaya chapter', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { name: 'Earth Biography' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Star on GitHub/i })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/plate-tectonics-deep-time-visualizer',
  );
  await expect(page.getByRole('link', { name: /Support/i })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita',
  );

  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText(/Reconstruction:/)).toBeVisible();

  const slider = page.getByLabel('Millions of years before present');
  await slider.evaluate((element) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, '55');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await expect(page.getByRole('heading', { name: 'Himalaya begins rising' })).toBeVisible();
  await expect(page.getByText(/v0\.1\.0/)).toBeVisible();
});
