import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class LoginPage extends GlobalPage {
  readonly getEmailField: Locator;
  readonly getPasswordField: Locator;
  readonly registerLink: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.getEmailField = page.getByTestId("email");
    this.getPasswordField = page.getByTestId("password");
    this.registerLink = page.getByTestId("register");
    this.title = page.getByTestId("title-login");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async submitLoginForm(email: string, password: string) {
    await this.page.getByTestId("email").fill(email);
    await this.page.getByTestId("password").fill(password);

    await this.page.getByTestId("submit").click();
  }
}
