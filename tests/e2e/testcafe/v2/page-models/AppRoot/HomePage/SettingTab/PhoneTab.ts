import { BaseWebComponent } from '../../../BaseWebComponent';

export class PhoneTab extends BaseWebComponent{

    // todo need have automation id
    get self(){
        return this.getSelectorByAutomationId('xxxxxxx');
    };

   get updateRegionDialog(){
       return this.getComponent(UpdateRegionDialog);
   }

    get callerIDField(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get regionField(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get extensionSettingsField(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get callerIDDropDownList(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get regionUpdateButton(){
        return this.getSelectorByAutomationId('xxxxxxx');
    } 

    async clickRegionUpdateButton(){
        await this.t.click(this.regionUpdateButton);
    }

    async callerIDDropDownListWithText(text:string){
        await this.t.expect(this.callerIDDropDownList.withText(text)).ok();
    }

    async callerIDFieldWithText(text:string){
        await this.t.expect(this.callerIDField.withText(text)).ok();
    }

    async regionFieldWithText(text:string){
        await this.t.expect(this.regionField.withText(text)).ok();
    }

    async extensionSettingsFieldWithText(text:string){
        await this.t.expect(this.extensionSettingsField.withText(text)).ok();
    }
}

export class UpdateRegionDialog extends BaseWebComponent{
    get self(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get successToast(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get title(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get statement(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get countryDropDown(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get areaCode(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get saveButton(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get cancelButton(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    async clickSaveButton(){
        await this.t.click(this.saveButton);
    }

    async clickCancelButton(){
        await this.t.click(this.cancelButton);
    }

    // TODO ?????
    async selectCountry(country:string){
        await this.t.click(this.countryDropDown.withText(country));
    }

    async showAreaCode(){
        await this.t.expect(this.areaCode.exists).ok();
    }

    async noAreaCode(){
        await this.t.expect(this.areaCode.exists).notOk();
    }

    async selectAreaCodeByIndex(index:number){
        await this.t.click(this.areaCode.nth(index));
    }

    async showUpdateRegionDialog(){
        await this.t.expect(this.self.exists).ok();
    }

    async noUpdateRegionDialog(){
        await this.t.expect(this.self.exists).notOk();
    }

    async showCountryDropDown(){
        await this.t.expect(this.countryDropDown.exists).ok();
    }

    async checkTitle(text:string){
        await this.t.expect(this.title.withText(text)).ok();
    }

    async checkStatement(text:string){
        await this.t.expect(this.statement.withText(text)).ok();
    }

    async checkSaveButton(text:string){
        await this.t.expect(this.saveButton.withText(text)).ok();
    }

    async checkCancelButton(text:string){
        await this.t.expect(this.cancelButton.withText(text)).ok();
    }

    async selectCountryByIndex(index:number){
        await this.t.click(this.countryDropDown.nth(index));
    }

    async checkSuccessToast(text:string){
        await this.t.expect(this.successToast.withText(text)).ok();
    }
}