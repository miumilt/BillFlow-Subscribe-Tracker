import { test, expect } from '@playwright/test'

test('App loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/BillFlow/)
})

test('Shows Telegram auth message when not in Telegram', async ({ page }) => {
  // Remove Telegram mock
  await page.addInitScript(() => {
    delete (window as any).Telegram
  })
  
  await page.goto('/')
  await expect(page.getByText(/Please open this app via Telegram/)).toBeVisible()
})

test('Dashboard shows add button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /Add subscription/i })).toBeVisible()
})

test('Navigation works', async ({ page }) => {
  await page.goto('/')
  
  // Click on Subscriptions tab
  await page.getByRole('button', { name: /Subs/i }).click()
  await expect(page.getByText(/Subscriptions/i)).toBeVisible()
  
  // Click on Analytics tab
  await page.getByRole('button', { name: /Stats/i }).click()
  await expect(page.getByText(/Analytics/i)).toBeVisible()
})
