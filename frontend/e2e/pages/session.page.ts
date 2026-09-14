import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class SessionPage extends GlobalPage {
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId("title-sessions");
  }

  async goto() {
    await this.page.goto("/sessions");
  }

  async gotoSessionById(id: number) {
    await this.page.goto(`/sessions/${id}`);
  }
}
