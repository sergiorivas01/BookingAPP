import { test, expect } from '@playwright/test';

test.describe('BookingAPP frontend - client and reservation flow', () => {
  test('can create a client and then create a reservation for that client', async ({ page }) => {
    // Go directly to clients page
    await page.goto('/clients');

    // Open "Add New Client" modal
    await page.getByRole('button', { name: /add new client/i }).click();

    // Fill client form
    await page.getByLabel(/name/i).fill('Sergio Rivas');
    await page.getByLabel(/email/i).fill('sergiorivas@gmail.com');
    await page.getByLabel(/phone/i).fill('+34675381682');

    // Submit client form
    await page.getByRole('button', { name: /create client|save/i }).click();

    // Wait for clients to be reloaded and for the new client row to appear
    const clientRow = page
      .locator('table.clients-table tbody tr')
      .filter({ hasText: 'Sergio Rivas' });
    await expect(clientRow).toBeVisible();

    // Go to reservations page
    await page.getByRole('link', { name: /reservations/i }).click();

    // Open "Create Reservation" modal
    await page.getByRole('button', { name: /create reservation/i }).click();

    // Select the client we just created
    // Note: The option text format is "Name (email)" as per ReservationForm.tsx
    await page.getByLabel(/client/i).selectOption({ label: 'Sergio Rivas (sergiorivas@gmail.com)' });

    // Compute dates: today and tomorrow in yyyy-mm-dd
    const now = new Date();
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];
    const dateAfterTomorrow = new Date(tomorrowDate);
    dateAfterTomorrow.setDate(dateAfterTomorrow.getDate() + 1);
    const dateAfterTomorrowString = dateAfterTomorrow.toISOString().split('T')[0];

    // Fill reservation form
    await page.getByLabel(/start date/i).fill(tomorrow);
    await page.getByLabel(/end date/i).fill(dateAfterTomorrowString);
    await page.getByLabel(/time/i).fill('19:30');
    await page.getByLabel(/number of guests/i).fill('2');

    // Submit reservation form
    // Use the form as context to target the submit button inside the modal, not the button that opens the modal
    await page.locator('form.reservation-form').getByRole('button', { name: /create reservation/i }).click();

    // Expect new reservation to show up in the list (empty-state disappears)
    await expect(
      page.getByText(/no reservations found\. create your first reservation/i)
    ).not.toBeVisible();

    // Expect at least one row in the reservations table
    const reservationsTableRow = page
      .locator('table.reservations-table tbody tr')
      .first();
    await expect(reservationsTableRow).toBeVisible();
  });
});


