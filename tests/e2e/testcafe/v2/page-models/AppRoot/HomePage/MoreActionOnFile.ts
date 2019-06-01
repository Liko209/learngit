import { BaseWebComponent } from "../../BaseWebComponent";


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

  get renameFileDialog(){
    return this.getComponent(RenameFileDialog);
  }

  async renameFileMenuShouldDisabled(){
    await this.t.expect(this.renameFileMenu.hasAttribute('disabled')).ok();
  }

  async clickMore(){
    await this.t.click(this.more);
  }
  
  async clickRenameFileMenu(){
    await this.t.click(this.renameFileMenu);
  }

  async renameFileMenuAtTop(menu:string){
    await this.t.expect(this.renameFileMenu.find('li').nth(0).withText(menu)).ok();
  }

}

export class RenameFileDialog extends BaseWebComponent{

    get self(){
      return this.getSelectorByAutomationId('fileNameEditDialogContainer');
    }
  
    get cancelButton(){
      return this.getSelectorByAutomationId('DialogCancelButton');
    }
  
    get saveButton(){
      return this.getSelectorByAutomationId('DialogOKButton');
    }
   
    get fileNameInput(){
      return this.getSelectorByAutomationId('fileNameEditSuffixFollowTextField').find('textarea').nth(2);
    }
  
    get fileNameSuffix(){
      return this.getSelectorByAutomationId('followSuffixText');
    }
  
    async clickCancelButton(){
      await this.t.click(this.cancelButton);
    }
  
    async clickSaveButton(){
      await this.t.click(this.saveButton);
    }
  
    async updateFileName(text:string){
      await this.clickAndTypeText(this.fileNameInput,text, { replace: true, paste: true });
    }
  
    async existFileNameWithSuffix(name:string, suffix:string){
      await this.t.expect(this.fileNameInput.withText(name)).ok();
      await this.t.expect(this.fileNameSuffix.withText(suffix)).ok();
    }
  
  }