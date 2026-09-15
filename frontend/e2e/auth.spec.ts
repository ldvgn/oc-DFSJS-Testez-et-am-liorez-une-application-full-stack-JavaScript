import { test, expect } from "./fixtures/coverage";
import { LoginPage } from "./pages/login.page";
import { RegisterPage } from "./pages/register.page";
import { SessionDetailPage } from "./pages/session-detail.page";
import { SessionPage } from "./pages/session.page";

test.describe("Authentication", () => {
  test.describe("Registration", () => {
    test("registers, then redirects to the sessions list", async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const loginPage = new LoginPage(page);
      const sessionPage = new SessionPage(page);
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
      await registerPage.expectAuthenticatedUserNavbar();
    });

    test("shows an error when registering with an already-used email", async ({
      page,
    }) => {
      const registerPage = new RegisterPage(page);

      await registerPage.goto();
      await registerPage.submitRegisterForm(
        "Firstname E2E",
        "Lastname E2E",
        "user@test.com",
        "password123",
      );

      await expect(page.getByText("Email already exists")).toBeVisible();
    });
  });

  test.describe("Login", () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
    });

    test("logs in with valid credentials and redirects to the sessions list", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      const sessionPage = new SessionPage(page);

      await loginPage.submitLoginForm("user@test.com", "test!1234");

      await expect(sessionPage.title).toBeVisible();
    });

    test("shows an error and stays on the page with invalid credentials", async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);

      await loginPage.submitLoginForm(
        "not-existing-user@e2e.test",
        "badpassword!",
      );

      await expect(page.getByText("Invalid credentials")).toBeVisible();
    });

    test("redirects to login when visiting a protected route while unauthenticated", async ({
      page,
    }) => {
      const sessionDetailPage = new SessionDetailPage(page);
      const loginPage = new LoginPage(page);

      await sessionDetailPage.goto(6);

      await expect(loginPage.title).toBeVisible();
    });

    test.describe("logged in", () => {
      test.use({ storageState: "playwright/.auth/user.json" });

      test("logs out and is redirected to login", async ({ page }) => {
        const sessionPage = new SessionPage(page);
        const loginPage = new LoginPage(page);

        await sessionPage.expectAuthenticatedUserNavbar();
        await sessionPage.logoutLink.click();

        await expect(loginPage.title).toBeVisible();
      });
    });
  });
});
