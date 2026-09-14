import { test, expect } from "./fixtures/coverage";

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

  test.describe("Login", () => {
    const user = {
      email: `e2e-login-${Date.now()}@e2e.test`,
      firstName: "Firstname E2E",
      lastName: "Lastname E2E",
      password: "password123",
    };

    test.beforeAll(async ({ request }) => {
      await request.post("/api/auth/register", { data: user });
    });

    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("logs in with valid credentials and lands on the sessions list", async ({
      page,
    }) => {
      await page.getByTestId("email").fill(user.email);
      await page.getByTestId("password").fill(user.password);

      await page.getByTestId("submit").click();

      await expect(page.getByTestId("title-sessions")).toBeVisible();
    });

    test("shows an error and stays on the page with invalid credentials", async ({
      page,
    }) => {
      await page.getByTestId("email").fill("not-existing-user@e2e.test");
      await page.getByTestId("password").fill("badpassword!");

      await page.getByTestId("submit").click();

      await expect(page.getByText("Invalid credentials")).toBeVisible();
    });

    test("logs out and is redirected to login", async ({ page }) => {
      await page.getByTestId("email").fill(user.email);
      await page.getByTestId("password").fill(user.password);

      await page.getByTestId("submit").click();

      await expect(page.getByTestId("nav-logout")).toBeVisible();
      await page.getByTestId("nav-logout").click();

      await expect(page.getByTestId("title-login")).toBeVisible();
    });

    test("redirects to login when visiting a protected route while unauthenticated", async ({
      page,
    }) => {
      await page.goto("/sessions/6");

      await expect(page.getByTestId("title-login")).toBeVisible();
    });
  });
});
