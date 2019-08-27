import { BaseWebComponent } from '../../BaseWebComponent';


export class RecentConversationDialog extends BaseWebComponent {
    get self(){
        return this.getSelectorByAutomationId('groupSearch');
    }

    get title(){
        return this.getSelectorByAutomationId('groupSearchTitle');
    }

    get closeButton(){
        return this.getSelectorByAutomationId('groupSearchCloseButton');
    }

    get clearButton(){
      return this.getSelectorByAutomationId('search-input-clear');
    }

    get searchBoxInput(){
        return this.getSelectorByAutomationId('groupSearchInput').find('input');
    }

    get recentConversationItem(){
        return this.getSelectorByAutomationId('groupSearchItem');
    }

    async enterNameInSearchBox(name:string){
        await this.t.typeText(this.searchBoxInput, name);
    }

    async clickConversationWithName(name:string){
        await this.t.click(this.recentConversationItem.find('div').nth(1).find('span').withText(name));
    }

    async clickEnter(){
        await this.t.pressKey('enter');
    }

    async openRecentConversationDialogWithShortcuts(key:string){
        await this.t.pressKey(key);
    }

    async clickClearButton(){
      await this.t.click(this.clearButton);
    }

    async existClearButton(){
      await this.t.expect(this.clearButton.exists).ok();
    }
}
