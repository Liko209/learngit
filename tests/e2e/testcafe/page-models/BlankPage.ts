import { BasePage } from './BasePage'

export class BlankPage extends BasePage {
  onEnter() { }
  onExit() { }

  open(url: string): this {
    this.t.navigateTo(url);
    return this;
  }
}
