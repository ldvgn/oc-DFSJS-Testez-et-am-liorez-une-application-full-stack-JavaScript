import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class SessionPage extends GlobalPage {
  readonly title: Locator;
  readonly createLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId("title-sessions");
    this.createLink = page.getByTestId("create-session");
  }

  async goto() {
    await this.page.goto("/sessions");
  }
}
