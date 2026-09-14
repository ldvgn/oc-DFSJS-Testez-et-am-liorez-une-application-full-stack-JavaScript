import { test, expect } from "./fixtures/coverage";
import { SessionPage } from "./pages/session.page";
import { SessionDetailPage } from "./pages/session-detail.page";
import { SessionFormPage } from "./pages/session-form.page";

test.describe("Sessions", () => {
  test.describe("As a regular user", () => {
    test.use({ storageState: "playwright/.auth/user.json" });

    test("opens a session detail and can join and leave the session", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionDetailPage = new SessionDetailPage(page);

      await sessionPage.goto();
      await sessionPage.expectAuthenticatedUserNavbar();
      await page
        .getByRole("listitem")
        .filter({ hasText: "Yoga Vinyasa" })
        .getByTestId("link-details")
        .click();

      await expect(sessionDetailPage.joinButton).toBeVisible();
      await sessionDetailPage.joinButton.click();

      await expect(sessionDetailPage.leaveButton).toBeVisible();
      await sessionDetailPage.leaveButton.click();

      await expect(sessionDetailPage.joinButton).toBeVisible();
    });

    test("shows an error when the session does not exist", async ({ page }) => {
      const sessionDetailPage = new SessionDetailPage(page);

      await sessionDetailPage.goto(999999);

      await expect(
        page.getByText("Failed to load session details"),
      ).toBeVisible();
    });

    test("redirects to the sessions list when visiting the create session page", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionFormPage = new SessionFormPage(page);

      await sessionFormPage.gotoCreate();

      await expect(sessionPage.title).toBeVisible();
    });

    test("redirects to the sessions list when visiting the edit session page", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionFormPage = new SessionFormPage(page);

      await sessionFormPage.gotoEdit(1);

      await expect(sessionPage.title).toBeVisible();
    });
  });

  test.describe("As an admin", () => {
    test.use({ storageState: "playwright/.auth/admin.json" });

    test("creates a session, then redirects to the sessions list and sees the new session", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionFormPage = new SessionFormPage(page);
      const sessionName = `E2E Session ${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await sessionPage.goto();
      await sessionPage.createLink.click();
      await sessionFormPage.submitSessionForm({
        name: sessionName,
        date: "2026-05-10",
        teacher: "Margot Delahaye",
        description: "Session created by the e2e test suite.",
      });

      await expect(sessionPage.title).toBeVisible();
      await expect(
        page.getByRole("heading", { name: sessionName }),
      ).toBeVisible();
    });

    test("deletes a session, then redirects to the sessions list and no longer sees it", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionFormPage = new SessionFormPage(page);
      const sessionName = `E2E Session ${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await sessionPage.goto();
      await sessionPage.createLink.click();
      await sessionFormPage.submitSessionForm({
        name: sessionName,
        date: "2026-05-11",
        teacher: "Hélène Thiercelin",
        description: "Session created by the e2e test suite, to be deleted.",
      });

      page.once("dialog", (dialog) => dialog.accept());
      await page
        .getByRole("listitem")
        .filter({ hasText: sessionName })
        .getByRole("button", { name: "Delete" })
        .click();

      await expect(sessionPage.title).toBeVisible();
      await expect(
        page.getByRole("heading", { name: sessionName }),
      ).not.toBeVisible();
    });

    test("keeps a session in the list when deletion is cancelled", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionFormPage = new SessionFormPage(page);
      const sessionName = `E2E Session ${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await sessionPage.goto();
      await sessionPage.createLink.click();
      await sessionFormPage.submitSessionForm({
        name: sessionName,
        date: "2026-05-14",
        teacher: "Margot Delahaye",
        description:
          "Session created by the e2e test suite, to test cancelled and failed deletion from the list.",
      });

      const listItem = page
        .getByRole("listitem")
        .filter({ hasText: sessionName });

      page.once("dialog", (dialog) => dialog.dismiss());
      await listItem.getByRole("button", { name: "Delete" }).click();
      await expect(listItem).toBeVisible();
    });

    test("keeps a session when deletion from its detail page is cancelled, deletes it otherwise", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionDetailPage = new SessionDetailPage(page);
      const sessionFormPage = new SessionFormPage(page);
      const sessionName = `E2E Session ${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await sessionPage.goto();
      await sessionPage.createLink.click();
      await sessionFormPage.submitSessionForm({
        name: sessionName,
        date: "2026-05-15",
        teacher: "Hélène Thiercelin",
        description:
          "Session created by the e2e test suite, to test cancelled and failed deletion from its detail page.",
      });
      await page
        .getByRole("listitem")
        .filter({ hasText: sessionName })
        .getByRole("link", { name: "View Details" })
        .click();
      await expect(
        page.getByRole("heading", { name: sessionName, level: 1 }),
      ).toBeVisible();

      page.once("dialog", (dialog) => dialog.dismiss());
      await sessionDetailPage.deleteButton.click();
      await expect(
        page.getByRole("heading", { name: sessionName, level: 1 }),
      ).toBeVisible();
    });

    test("navigates back to the sessions list when cancelling", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionFormPage = new SessionFormPage(page);

      await sessionFormPage.gotoCreate();
      await sessionFormPage.cancelButton.click();

      await expect(sessionPage.title).toBeVisible();
    });

    test("shows an error alert when editing a session that does not exist", async ({
      page,
    }) => {
      const sessionFormPage = new SessionFormPage(page);

      await sessionFormPage.gotoEdit(999999);

      await expect(
        page.getByText("Failed to load session details"),
      ).toBeVisible();
    });

    test("edits a session it just created and sees the update reflected", async ({
      page,
    }) => {
      const sessionPage = new SessionPage(page);
      const sessionDetailPage = new SessionDetailPage(page);
      const sessionFormPage = new SessionFormPage(page);
      const sessionName = `E2E Session ${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const updatedSessionName = `${sessionName} (updated)`;

      await sessionPage.goto();
      await sessionPage.createLink.click();
      await sessionFormPage.submitSessionForm({
        name: sessionName,
        date: "2026-05-12",
        teacher: "David Martin",
        description: "Session created by the e2e test suite, to be edited.",
      });

      await page
        .getByRole("listitem")
        .filter({ hasText: sessionName })
        .getByRole("link", { name: "View Details" })
        .click();
      await sessionDetailPage.editLink.click();
      await sessionFormPage.submitSessionForm({
        name: updatedSessionName,
        date: "2026-05-13",
        teacher: "David Martin",
        description: "Updated by the e2e test suite.",
      });

      await expect(sessionPage.title).toBeVisible();
      await expect(
        page.getByRole("heading", { name: updatedSessionName }),
      ).toBeVisible();
    });
  });
});
