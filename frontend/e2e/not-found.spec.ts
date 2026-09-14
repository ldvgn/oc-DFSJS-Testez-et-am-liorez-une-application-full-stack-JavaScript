import { test, expect } from "./fixtures/coverage";
import { LoginPage } from "./pages/login.page";
import { NotFoundPage } from "./pages/not-found.page";
import { SessionPage } from "./pages/session.page";

test.describe("NotFound", () => {
  test("shows a 404 page for an unknown route", async ({ page }) => {
    const notFoundPage = new NotFoundPage(page);

    await notFoundPage.goto("/this-page-does-not-exist");

    await expect(notFoundPage.title).toBeVisible();
    await expect(
      page.getByText(
        "Désolé, nous n'avons pas trouvé la page que vous recherchez.",
      ),
    ).toBeVisible();
  });

  test("redirects to login when navigating back while unauthenticated", async ({
    page,
  }) => {
    const notFoundPage = new NotFoundPage(page);
    const loginPage = new LoginPage(page);

    await notFoundPage.goto("/this-page-does-not-exist");
    await notFoundPage.backLink.click();

    await expect(loginPage.title).toBeVisible();
  });

  test.describe("logged in", () => {
    test.use({ storageState: "playwright/.auth/user.json" });

    test("redirects to the sessions list when navigating back", async ({
      page,
    }) => {
      const notFoundPage = new NotFoundPage(page);
      const sessionPage = new SessionPage(page);

      await notFoundPage.goto("/this-page-does-not-exist");
      await notFoundPage.backLink.click();

      await expect(sessionPage.title).toBeVisible();
    });
  });
});
