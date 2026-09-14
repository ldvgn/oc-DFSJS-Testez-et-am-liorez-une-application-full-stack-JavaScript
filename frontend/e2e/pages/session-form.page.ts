import { type Locator, type Page } from "@playwright/test";
import { GlobalPage } from "./global.page";

export class SessionFormPage extends GlobalPage {
  readonly nameField: Locator;
  readonly dateField: Locator;
  readonly teacherSelect: Locator;
  readonly descriptionField: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameField = page.getByLabel("Session Name");
    this.dateField = page.getByLabel("Date");
    this.teacherSelect = page.getByLabel("Teacher");
    this.descriptionField = page.getByLabel("Description");
    this.submitButton = page.getByTestId("submit");
    this.cancelButton = page.getByTestId("cancel");
  }

  async gotoCreate() {
    await this.page.goto("/sessions/create");
  }

  async gotoEdit(id: number) {
    await this.page.goto(`/sessions/edit/${id}`);
  }

  async submitSessionForm({
    name,
    date,
    teacher,
    description,
  }: {
    name: string;
    date: string;
    teacher: string;
    description: string;
  }) {
    await this.nameField.fill(name);
    await this.dateField.fill(date);
    await this.teacherSelect.selectOption({ label: teacher });
    await this.descriptionField.fill(description);

    await this.submitButton.click();
  }
}
