import { test, expect } from "./fixtures/coverage";
import { LoginPage } from "./pages/login.page";
import { ProfilePage } from "./pages/profile.page";
import { RegisterPage } from "./pages/register.page";
import { SessionPage } from "./pages/session.page";

test.describe("Profile", () => {
  test("redirects to login when visiting the profile page while unauthenticated", async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    const loginPage = new LoginPage(page);

    await profilePage.goto();

    await expect(loginPage.title).toBeVisible();
  });

  test.describe("As a regular user", () => {
    test.use({ storageState: "playwright/.auth/user.json" });

    test("displays the current user's information", async ({ page }) => {
      const sessionPage = new SessionPage(page);
      const profilePage = new ProfilePage(page);

      await sessionPage.goto();
      await sessionPage.profileLink.click();

      await expect(profilePage.title).toBeVisible();
      await expect(page.getByText("John")).toBeVisible();
      await expect(page.getByText("Doe")).toBeVisible();
      await expect(page.getByText("user@test.com")).toBeVisible();
      await expect(page.getByText("User", { exact: true })).toBeVisible();
      await expect(profilePage.promoteButton).toBeVisible();
    });
  });

  test.describe("As an admin", () => {
    test.use({ storageState: "playwright/.auth/admin.json" });

    test("shows the Administrator badge and no promote button", async ({
      page,
    }) => {
      const profilePage = new ProfilePage(page);

      await profilePage.goto();

      await expect(page.getByText("Administrator")).toBeVisible();
      await expect(profilePage.promoteButton).not.toBeVisible();
    });
  });

  test.describe("Promoting to admin", () => {
    test("registers a new user, then promotes them to admin from the profile page", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      const sessionPage = new SessionPage(page);
      const profilePage = new ProfilePage(page);
      const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@e2e.test`;

      await loginPage.goto();
      await loginPage.registerLink.click();
      await registerPage.submitRegisterForm(
        "Firstname E2E",
        "Lastname E2E",
        email,
        "password123",
      );

      await expect(sessionPage.title).toBeVisible();

      await sessionPage.profileLink.click();

      await expect(page.getByText("User", { exact: true })).toBeVisible();

      await profilePage.promoteButton.click();

      await expect(page.getByText("Administrator")).toBeVisible();
    });
  });

  test.describe("Deleting the account", () => {
    test("deletes the account after confirmation and redirects to login", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      const sessionPage = new SessionPage(page);
      const profilePage = new ProfilePage(page);
      const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@e2e.test`;

      await loginPage.goto();
      await loginPage.registerLink.click();
      await registerPage.submitRegisterForm(
        "Firstname E2E",
        "Lastname E2E",
        email,
        "password123",
      );

      await expect(sessionPage.title).toBeVisible();

      await sessionPage.profileLink.click();
      await expect(profilePage.title).toBeVisible();

      page.once("dialog", (dialog) => dialog.accept());
      await profilePage.deleteButton.click();

      await expect(loginPage.title).toBeVisible();
    });
  });
});
