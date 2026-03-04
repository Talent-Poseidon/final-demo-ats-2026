import { test, expect } from '@playwright/test';

test.describe('Admin Project Management', () => {
  test('Access Project Page', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('link', { name: 'Projects' }).click(); // Updated to use role and name
    await expect(page).toHaveURL('/admin/projects');
  });

  test('View Project List', async ({ page }) => {
    await page.goto('/admin/projects');
    await expect(page.getByTestId('project-list')).toBeVisible();
  });

  test('Setup New Project with Multiple Assignees', async ({ page }) => {
    await page.goto('/admin/projects');
    await page.getByTestId('setup-new-project-btn').click();
    await page.getByTestId('project-name-input').fill('New Project');
    await page.getByTestId('start-date-input').click();
    await page.getByRole('button', { name: '1' }).click(); // Selects 1st of the month
    await page.getByTestId('end-date-input').click();
    await page.getByRole('button', { name: '1' }).click(); // Selects 1st of the month
    await page.getByTestId('assignee-email-input').fill('john.doe@example.com');
    await page.getByTestId('assignee-name-input').fill('John Doe');
    await page.getByTestId('submit-project-btn').click();
    await expect(page.getByTestId('confirmation-message')).toBeVisible();
    await expect(page.getByTestId('confirmation-message')).toHaveText('Project created successfully');
  });

  test('Validation Error on Project Setup', async ({ page }) => {
    await page.goto('/admin/projects');
    await page.getByTestId('setup-new-project-btn').click();
    await page.getByTestId('project-name-input').fill('');
    await page.getByTestId('submit-project-btn').click();
    await expect(page.getByText('Project name is required')).toBeVisible();
  });

  test('Invalid Email Format', async ({ page }) => {
    await page.goto('/admin/projects');
    await page.getByTestId('setup-new-project-btn').click();
    await page.getByTestId('assignee-email-input').fill('invalid-email');
    await page.getByTestId('assignee-name-input').fill('Invalid User');
    await page.getByTestId('submit-project-btn').click();
    await expect(page.getByText('Invalid email format')).toBeVisible();
  });
});
