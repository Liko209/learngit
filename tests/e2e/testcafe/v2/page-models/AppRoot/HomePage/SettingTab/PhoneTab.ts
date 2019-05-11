import { BaseWebComponent } from '../../../BaseWebComponent';
export class PhoneTab extends BaseWebComponent{
    // todo need have automation id
    get self(){
        return this.getSelectorByAutomationId('SettingContainer');
    };

    get generalLabel(){
        return this.getSelectorByAutomationId('SettingSectionHeader').find('.setting-section-title');
    }

    get callerIDLabel(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get callerIDDescription(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get callerIDDropDown(){
        return this.getSelectorByAutomationId('SettingSelectBox');
    }

    get callerIDDropDownList(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get updateRegionDialog(){
        return this.getComponent(UpdateRegionDialog);
    }

    get regionLabel(){
        return this.getSelectorByAutomationId('SettingSectionItemLabel-regionSetting');
    }

    get regionDescription(){
        return this.getSelectorByAutomationId('SettingSectionItemDescription-regionSetting');
    }

    get regionUpdateButton(){
        return this.getSelectorByAutomationId('regionSettingDialogOpenButton');
    } 

    get extensionSettingsLabel(){
        return this.getSelectorByAutomationId('SettingItemLabel');
    }

    get extensionSettingsDescription(){
        return this.getSelectorByAutomationId('SettingItemDescription');
    }

    get extensionUpdateButton(){
        return this.getSelectorByAutomationId('settingPhoneGeneralExtensionSetting');
    }

    async existsGeneralLabel(text: string){
        await this.t.expect(this.generalLabel.withText(text).exists).ok();
    }

    // Region settings
    async clickRegionUpdateButton(){
        await this.t.click(this.regionUpdateButton);
    }

    async regionDescriptionWithText(text:string){
        await this.t.expect(this.regionDescription.withText(text).exists).ok();
    }

    async existRegionLabel(text:string){
        await this.t.expect(this.regionLabel.withText(text).exists).ok();
    }

    // Caller id settings
    async existCallerIDLabel(text:string){
        await this.t.expect(this.callerIDLabel.withText(text).exists).ok();
    }

    async existCallerIDDescription(text:string){
        await this.t.expect(this.callerIDDescription.withText(text).exists).ok();
    }

    async existCallerIDDropDown(){
        await this.t.expect(this.callerIDDropDownList.exists).ok();
    }

    async callerIDDropDownListWithText(text:string){
        await this.t.expect(this.callerIDDropDownList.withText(text).exists).ok();
    }

    async clickCallerIDDropDown(){
        await this.t.click(this.callerIDDropDown);
    }

    async selectCallerID(text: string){
        await this.t.click(this.callerIDDropDownList.withText(text));
    }

    async getCallerIDList(){
        let callerIDList = [];
        const length = this.callerIDDropDownList.length;
        for(let i = 0; i< length; i++){
          callerIDList.push(this.callerIDDropDownList.nth(i).innerText);
        }
        return callerIDList;
    }

    // Extension setting
    async existExtensionSettingsLabel(text:string){
        await this.t.expect(this.extensionSettingsLabel.withText(text).exists).ok();
    }

    async existExtensionSettingsDescription(text:string){
        await this.t.expect(this.extensionSettingsDescription.withText(text).exists).ok();
    }
    
    async existExtensionUpdateButton(){
        await this.t.expect(this.extensionUpdateButton.exists).ok();
    }
}

export class UpdateRegionDialog extends BaseWebComponent{
    get self(){
        return this.getSelectorByAutomationId('regionSettingDialogHeader');
    }

    get successToast(){
        return this.getSelectorByAutomationId('xxxxxxx');
    }

    get title(){
        return this.getSelectorByAutomationId('regionSettingDialogHeader');
    }

    get statement(){
        return this.getSelectorByAutomationId('regionSettingDialogContentDescription');
    }

    get countryDropDown(){
        return this.getSelectorByAutomationId('regionSettingDialPlanSelect');
    }

    get countryDropDownList(){
        return this.getSelectorByAutomationId('regionSettingDialPlanSelectItem');
    }

    get countryLabel(){
        return this.countryDropDown.find('label');
    }

    get areaCode(){
        return this.getSelectorByAutomationId('areaCodeTextField');
    }

    get areaCodeLabel(){
        return this.areaCode.find('label');
    }

    get saveButton(){
        return this.getSelectorByAutomationId('saveRegionSettingOkButton');
    }

    get cancelButton(){
        return this.getSelectorByAutomationId('saveRegionSettingCancelButton');
    }

    async showUpdateRegionDialog(){
        await this.t.expect(this.self.exists).ok();
    }

    async noUpdateRegionDialog(){
        await this.t.expect(this.self.exists).notOk();
    }

    async clickSaveButton(){
        await this.t.click(this.saveButton);
    }

    async clickCancelButton(){
        await this.t.click(this.cancelButton);
    }

    async showAreaCode(){
        await this.t.expect(this.areaCode.exists).ok();
    }

    async existAreaCodeLabel(text:string){
        await this.t.expect(this.areaCodeLabel.withText(text)).ok();
    }

    async noAreaCode(){
        await this.t.expect(this.areaCode.exists).notOk();
    }

    async setAreaCode(text:string){
        await this.t.typeText(this.areaCode, text);
    }

    async existAreaCodeWithText(text:string){
        await this.t.expect(this.areaCode.withText(text)).ok();
    }

    async showCountryDropDown(){
        await this.t.expect(this.countryDropDown.exists).ok();
    }

    async clickCountryDropDown(){
        await this.t.click(this.countryDropDown);
    }

    async selectCountryWithText(text:string){
        await this.t.click(this.countryDropDownList.withText(text));
    }

    async countrySelectedWithText(text:string){
        await this.t.expect(this.countryDropDown.withText(text)).ok();
    }

    async checkTitle(text:string){
        await this.t.expect(this.title.withText(text)).ok();
    }

    async checkStatement(text:string){
        await this.t.expect(this.statement.withText(text)).ok();
    }

    async existCountryLabel(text:string){
        await this.t.expect(this.countryLabel.withText(text)).ok();
    }

    async checkSaveButton(text:string){
        await this.t.expect(this.saveButton.withText(text)).ok();
    }

    async checkCancelButton(text:string){
        await this.t.expect(this.cancelButton.withText(text)).ok();
    }

    async checkSuccessToast(text:string){
        await this.t.expect(this.successToast.withText(text)).ok();
    }
}