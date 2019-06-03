import { BaseWebComponent } from "../../BaseWebComponent";
import { H } from '../../../helpers';

export class MoreActionOnFile extends BaseWebComponent{

  get self(){
    return this.getSelectorByAutomationId('fileActionMore');
  }

  get more(){
    return this.getSelectorByAutomationId('fileActionMore');
  }

  get renameFileMenu(){
    return this.getSelectorByAutomationId('fileNameEditItem');
  }

  get fileActionMenuList(){
    return this.getSelectorByAutomationId('fileActionMenuList');
  }

  get renameFileDialog(){
    return this.getComponent(RenameFileDialog);
  }


  async renameFileMenuDisabledOrNot(status:boolean){
    await this.t.expect(this.renameFileMenu.attributes).contains({'data-disabled':`${status}`});
  }

  async clickMore(){
    await this.t.click(this.more);
  }
  
  async clickRenameFileMenu(){
    await this.t.click(this.renameFileMenu);
  }

  async renameFileMenuAtTop(menu:string){
    await this.t.expect(this.fileActionMenuList.nth(0).withText(menu).exists).ok();
  }

}

export class RenameFileDialog extends BaseWebComponent{

    get self(){
      return this.getSelectorByAutomationId('fileNameEditDialog');  
    }
  
    get cancelButton(){
      return this.getSelectorByAutomationId('DialogCancelButton');
    }
  
    get saveButton(){
      return this.getSelectorByAutomationId('DialogOKButton');
    }
   
    get fileNameInput(){
      return this.getSelectorByAutomationId('fileNameEditInput');
    }

    // todo
    get fileNameInputValue(){
      return this.getSelectorByAutomationId('followSuffixTextFieldInputValue');
    }
  
    get fileNameSuffix(){
      return this.getSelectorByAutomationId('followSuffixTextFieldSuffixEl');
    }
  
    async clickCancelButton(){
      await this.t.click(this.cancelButton);
    }
  
    async clickSaveButton(){
      await this.t.click(this.saveButton);
      await this.waitForAllSpinnersToDisappear();
    }
  
    async updateFileName(text:string){
      await this.clickAndTypeText(this.fileNameInput,text, { replace: true, paste: true });
    }
  
    async existFileNameWithSuffix(name:string, suffix:string){
      await this.t.expect(this.fileNameInputValue.withExactText(name).exists).ok();
      await this.t.expect(this.fileNameSuffix.withExactText(H.escapePostText(suffix)).exists).ok();
    }

    // todo
    async saveButtonShouldDisabled(){
      await this.t.expect(this.saveButton.hasAttribute('disabled')).ok();
    }
  
  }