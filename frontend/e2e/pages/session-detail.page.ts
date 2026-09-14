import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class SessionDetailPage extends GlobalPage {
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  readonly joinButton: Locator;
  readonly leaveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editLink = page.getByRole("link", { name: "Edit" });
    this.deleteButton = page.getByRole("button", { name: "Delete" });
    this.joinButton = page.getByRole("button", { name: "Join Session" });
    this.leaveButton = page.getByRole("button", { name: "Leave Session" });
  }

  async goto(id: number) {
    await this.page.goto(`/sessions/${id}`);
  }
}
