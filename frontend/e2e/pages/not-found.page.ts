import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class NotFoundPage extends GlobalPage {
  readonly title: Locator;
  readonly backLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole("heading", {
      name: "Page introuvable",
      level: 1,
    });
    this.backLink = page.getByRole("link", { name: "Retour" });
  }

  async goto(path = "/this-page-does-not-exist") {
    await this.page.goto(path);
  }
}
