import { BasePage } from './BasePage'


export class BlankPage extends BasePage {

  open(url: string): this {
    return this.chain(t =>
      t.navigateTo(url)
    )
  }
}
