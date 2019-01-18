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

    get moreTab() {
      return this.getSelectorByAutomationId('rightRail-tab-more');
    }

    nthListItem(automationId: string, n: number) {
      return this.getSelectorByAutomationId(automationId).nth(n);
    }

    getTab(text: string) {
      return this.tabList.find('button span').withText(text);
    }

    async clickTab(text: string) {
      await this.t.click(this.getTab(text))
    }

    async clickMore() {
      await this.t.click(this.moreTab);
    }

    getMenu(automationID: string) {
      return this.getSelectorByAutomationId(automationID);
    }

    async clickMenu(automationID: string) {
      await this.t.click(this.getMenu(automationID));
    }

}
