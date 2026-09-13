import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.describe("Registration", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("registers, then lands on the sessions list", async ({ page }) => {
      const email = `e2e-${Date.now()}@e2e.test`;

      await page.getByTestId("register").click();
      await page.getByTestId("firstname").fill("Firstname E2E");
      await page.getByTestId("lastname").fill("Lastname E2E");
      await page.getByTestId("email").fill(email);
      await page.getByTestId("password").fill("password123");

      await page.getByTestId("submit").click();

      await expect(page.getByTestId("title-sessions")).toBeVisible();

      await expect(page.getByTestId("nav-sessions")).toBeVisible();
      await expect(page.getByTestId("nav-profile")).toBeVisible();
      await expect(page.getByTestId("nav-logout")).toBeVisible();
      await expect(page.getByTestId("nav-login")).not.toBeVisible();
      await expect(page.getByTestId("nav-register")).not.toBeVisible();

      // When register me, I'm not admin
      await expect(page.getByTestId("nav-create")).not.toBeVisible();
    });
  });
});
