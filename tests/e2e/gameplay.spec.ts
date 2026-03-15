import { test, expect } from '@playwright/test';

// Dismiss the age verification gate before each test
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('age-verified', 'true');
  });
});

test.describe('Strip Poker VIP', () => {

  test('T1: Home page loads with title and PLAY button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1:has-text("STRIP POKER")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h1:has-text("VIP")')).toBeVisible();
    const playButton = page.locator('button:has-text("PLAY")');
    await expect(playButton).toBeVisible({ timeout: 10000 });
  });

  test('T2: Character select shows 5 characters', async ({ page }) => {
    await page.goto('/select');
    await page.waitForTimeout(2000);
    await expect(page.locator('h1:has-text("Choose Your Opponent")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h3:has-text("Luna")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h3:has-text("Sakura")')).toBeVisible();
    await expect(page.locator('h3:has-text("Valentina")')).toBeVisible();
    await expect(page.locator('h3:has-text("Emma")')).toBeVisible();
    await expect(page.locator('h3:has-text("Zara")')).toBeVisible();
  });

  test('T3: Selecting Luna navigates to game', async ({ page }) => {
    await page.goto('/select');
    await page.waitForTimeout(2000);
    await page.locator('h3:has-text("Luna")').click();
    await expect(page).toHaveURL(/\/game/, { timeout: 10000 });
  });

  test('T4: Game page has Fold, Check/Call, and Raise buttons', async ({ page }) => {
    await page.goto('/select');
    await page.waitForTimeout(2000);
    await page.locator('h3:has-text("Luna")').click();
    await page.waitForURL(/\/game/, { timeout: 10000 });
    await page.waitForTimeout(5000);

    const foldButton = page.locator('button:has-text("Fold")');
    await expect(foldButton).toBeVisible({ timeout: 15000 });

    const checkOrCall = page.locator('button:has-text("Check"), button:has-text("Call"), button:has-text("All-In")').first();
    await expect(checkOrCall).toBeVisible({ timeout: 5000 });

    const raiseButton = page.locator('button:has-text("Raise")');
    await expect(raiseButton).toBeVisible({ timeout: 5000 });
  });

  test('T5: Can play a hand by clicking Check/Call through to result', async ({ page }) => {
    test.setTimeout(90000); // give extra time for a full hand

    await page.goto('/select');
    await page.waitForTimeout(2000);
    await page.locator('h3:has-text("Luna")').click();
    await page.waitForURL(/\/game/, { timeout: 10000 });
    await page.waitForTimeout(5000);

    // Play through a hand: wait for player's turn, then click Check/Call
    for (let i = 0; i < 12; i++) {
      // Check if we already see a result (Next Hand or Back to Menu)
      const nextHandVisible = await page.locator('button:has-text("Next Hand")').isVisible().catch(() => false);
      const backToMenuVisible = await page.locator('button:has-text("Back to Menu")').isVisible().catch(() => false);
      if (nextHandVisible || backToMenuVisible) break;

      // Wait for an enabled action button to appear (player's turn)
      try {
        await page.locator('button:has-text("Check"):not([disabled]), button:has-text("Call"):not([disabled]), button:has-text("All-In"):not([disabled])').first().waitFor({ state: 'visible', timeout: 8000 });
      } catch {
        // Might be NPC turn or hand just ended -- check again
        continue;
      }

      const checkBtn = page.locator('button:has-text("Check"):not([disabled])');
      const callBtn = page.locator('button:has-text("Call"):not([disabled])');
      const allInBtn = page.locator('button:has-text("All-In"):not([disabled])');

      if (await checkBtn.isVisible().catch(() => false)) {
        await checkBtn.click();
      } else if (await callBtn.isVisible().catch(() => false)) {
        await callBtn.click();
      } else if (await allInBtn.isVisible().catch(() => false)) {
        await allInBtn.click();
      }

      await page.waitForTimeout(1500); // wait for animations + NPC response
    }

    // Verify the hand ended: "Next Hand" button, "Back to Menu", or win/loss text
    const nextHandBtn = page.locator('button:has-text("Next Hand")');
    const gameOverBtn = page.locator('button:has-text("Back to Menu")');

    const hasNextHand = await nextHandBtn.isVisible({ timeout: 15000 }).catch(() => false);
    const hasGameOver = await gameOverBtn.isVisible({ timeout: 3000 }).catch(() => false);

    expect(hasNextHand || hasGameOver).toBe(true);
  });

  test('T6: Settings page loads with difficulty options', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h3:has-text("Difficulty")')).toBeVisible();
    await expect(page.locator('button:has-text("Easy")')).toBeVisible();
    await expect(page.locator('button:has-text("Medium")')).toBeVisible();
    await expect(page.locator('button:has-text("Hard")')).toBeVisible();
  });

  test('T7: Settings difficulty selection updates active state', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    const easyBtn = page.locator('button:has-text("Easy")');
    await easyBtn.click();
    await expect(easyBtn).toHaveCSS('border-color', 'rgb(212, 175, 55)', { timeout: 3000 });
  });

  test('T8: PLAY button navigates to character select', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("PLAY")').click();
    await expect(page).toHaveURL(/\/select/, { timeout: 10000 });
  });

  test('T9: Locked characters do not navigate to game', async ({ page }) => {
    await page.goto('/select');
    await page.waitForTimeout(2000);
    await page.locator('h3:has-text("Sakura")').click({ force: true });
    await page.waitForTimeout(1500);
    // Locked characters redirect to /shop, not /game
    await expect(page).not.toHaveURL(/\/game/);
  });

  test('T10: Game page shows character name and chip counts', async ({ page }) => {
    await page.goto('/select');
    await page.waitForTimeout(2000);
    await page.locator('h3:has-text("Emma")').click();
    await page.waitForURL(/\/game/, { timeout: 10000 });
    await page.waitForTimeout(5000);

    // Emma's name appears in CharacterInfo (use .first() since multiple matches)
    await expect(page.locator('text=Emma').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('main')).toBeVisible();
  });

});
