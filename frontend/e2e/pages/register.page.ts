import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class RegisterPage extends GlobalPage {
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly firstnameField: Locator;
  readonly lastnameField: Locator;

  constructor(page: Page) {
    super(page);
    this.emailField = page.getByTestId("email");
    this.passwordField = page.getByTestId("password");
    this.firstnameField = page.getByTestId("firstname");
    this.lastnameField = page.getByTestId("lastname");
  }

  async goto() {
    await this.page.goto("/register");
  }

  async submitRegisterForm(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
  ) {
    await this.page.getByTestId("firstname").fill(firstname);
    await this.page.getByTestId("lastname").fill(lastname);
    await this.page.getByTestId("email").fill(email);
    await this.page.getByTestId("password").fill(password);

    await this.page.getByTestId("submit").click();
  }
}
