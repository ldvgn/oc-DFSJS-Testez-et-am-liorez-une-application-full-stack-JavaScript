import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class ProfilePage extends GlobalPage {
  readonly title: Locator;
  readonly promoteButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole("heading", { name: "My Profile", level: 1 });
    this.promoteButton = page.getByRole("button", {
      name: "Promote to Admin (Dev)",
    });
    this.deleteButton = page.getByRole("button", { name: "Delete Account" });
  }

  async goto() {
    await this.page.goto("/profile");
  }
}
