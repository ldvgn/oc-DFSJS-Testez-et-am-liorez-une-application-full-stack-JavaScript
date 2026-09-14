import { expect, type Page, type Locator } from "@playwright/test";

export class GlobalPage {
  readonly page: Page;
  readonly sessionsLink: Locator;
  readonly sessionsCreateLink: Locator;
  readonly profileLink: Locator;
  readonly logoutLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sessionsLink = page.getByTestId("nav-sessions");
    this.sessionsCreateLink = page.getByTestId("nav-create");
    this.profileLink = page.getByTestId("nav-profile");
    this.logoutLink = page.getByTestId("nav-logout");
    this.loginLink = page.getByTestId("nav-login");
    this.registerLink = page.getByTestId("nav-register");
  }

  async expectAuthenticatedUserNavbar() {
    await expect(this.sessionsLink).toBeVisible();
    await expect(this.sessionsCreateLink).not.toBeVisible();
    await expect(this.profileLink).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
    await expect(this.loginLink).not.toBeVisible();
    await expect(this.registerLink).not.toBeVisible();
  }

  async expectAuthenticatedAdminNavbar() {
    await expect(this.sessionsLink).toBeVisible();
    await expect(this.sessionsCreateLink).toBeVisible();
    await expect(this.profileLink).toBeVisible();
    await expect(this.logoutLink).toBeVisible();
    await expect(this.loginLink).not.toBeVisible();
    await expect(this.registerLink).not.toBeVisible();
  }

  async expectUnauthenticatedNavbar() {
    await expect(this.sessionsLink).not.toBeVisible();
    await expect(this.sessionsCreateLink).not.toBeVisible();
    await expect(this.profileLink).not.toBeVisible();
    await expect(this.logoutLink).not.toBeVisible();
    await expect(this.loginLink).toBeVisible();
    await expect(this.registerLink).toBeVisible();
  }
}
