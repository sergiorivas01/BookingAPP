import { test, expect } from '@playwright/test';

test.describe('BookingAPP frontend - basic navigation', () => {
  test('can load home/dashboard page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Booking/i);

    // Check that the main navigation is visible
    await expect(page.getByRole('navigation')).toBeVisible();

    // And the Dashboard heading is present
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('can navigate between main sections', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation');

    const sections = [
      { link: 'Dashboard', heading: 'Dashboard' },
      { link: 'Clients', heading: 'Client Management' },
      { link: 'Reservations', heading: 'Reservation Management' },
      { link: 'Properties', heading: 'Property Management' },
    ] as const;

    for (const { link, heading } of sections) {
      await nav.getByRole('link', { name: link }).click();
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });
});


