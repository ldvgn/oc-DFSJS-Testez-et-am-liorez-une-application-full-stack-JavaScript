import { test as setup } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

setup("log in as admin", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.submitLoginForm("yoga@studio.com", "test!1234");

  await page.getByTestId("title-sessions").waitFor();
  await page.context().storageState({ path: "playwright/.auth/admin.json" });
});

setup("log in as user", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.submitLoginForm("user@test.com", "test!1234");

  await page.getByTestId("title-sessions").waitFor();
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
