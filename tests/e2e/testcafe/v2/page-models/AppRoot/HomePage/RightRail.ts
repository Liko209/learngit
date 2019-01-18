import { BaseWebComponent } from "../../BaseWebComponent";




export class RightRail extends BaseWebComponent {

    get self() {
        return this.getSelectorByAutomationId('rightRail');
    }

    get tabList() {
      return this.self.find('[role="tablist"]')
    }

    get listSubTitle() {
      return this.getSelectorByAutomationId('rightRail-list-subtitle');
    }

    nthListItem(automationId: string, n: number) {
      return this.getSelectorByAutomationId(automationId).nth(n);
    }

    getTab(text: string) {
      return this.getSelectorByAutomationId(`rightShelf-${text}`);
    }

    async clickTab(text: string) {
      await this.t.click(this.getTab(text))
    }


}
