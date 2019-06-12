import * as _ from 'lodash';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire, SITE_ENV } from '../../../config';
import { ITestMeta } from "../../../v2/models";

fixture('Phone/GeneralSettings')
  .beforeEach(setupCase(BrandTire.RC_WITH_DID))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1753'],
  maintainers: ['Mia.cai'],
  keywords: ['GeneralSettings']
})(`Check the page content of the "General" section`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  const generalLabel = 'General';
  const regionLabel = 'Region';
  const callerIDLabel = 'Caller ID';
  const callerIDDescription = 'Choose your default Caller ID for making RingCentral phone calls';
  const extensionSettingsLabel = 'Extension settings';
  const extensionSettingsDescription = 'Customize your RingCentral extension settings (call routing, voicemail greetings and more)';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`Then I can see '${generalLabel}' in the 'General' section`, async () => {
    await phoneSettingPage.existsGeneralLabel(generalLabel);
  });

  await h(t).withLog(`And I can see '${regionLabel}' in the 'General' section`, async () => {
    await phoneSettingPage.existRegionLabel(regionLabel);
  });

  await h(t).withLog(`And I can see Caller ID label/Caller ID description/DropDown select box in the 'General' section`, async () => {
    await phoneSettingPage.existCallerIDLabel(callerIDLabel);
    await phoneSettingPage.existCallerIDDescription(callerIDDescription);
    await phoneSettingPage.existCallerIDDropDown();
  });

  await h(t).withLog(`And I can see extension label/extension description/Update button in the 'General' section`, async () => {
    await phoneSettingPage.existExtensionSettingsLabel(extensionSettingsLabel);
    await phoneSettingPage.existExtensionSettingsDescription(extensionSettingsDescription);
    await phoneSettingPage.existExtensionUpdateButton();
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1756'],
  maintainers: ['Mia.cai'],
  keywords: ['GeneralSettings']
})(`Check the caller id drop down list shows available numbers for the user`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  let callerIDList = [];

  await h(t).withLog(`Given I get login user phone number info`, async () => {
    const res = await h(t).platform(loginUser).getExtensionPhoneNumberList();
    const records = res.data.records;
    for (let i in records) {
      callerIDList.push(records[i]['phoneNumber']);
    }
    callerIDList.push('Blocked');
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click caller id DropDown`, async () => {
    await phoneSettingPage.clickCallerIDDropDown();
  });

  await h(t).withLog(`Then I can see the Caller IDs in the list`, async () => {
    await phoneSettingPage.checkCallerIDItemCount(callerIDList.length);
    await phoneSettingPage.callerIDDropDownItemContains(callerIDList);
  });

});

// Region settings
test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1788'],
  maintainers: ['Mia.Cai'],
  keywords: ['GeneralSettings']
})(`Check if the content of region section is displayed correctly;`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog = settingTab.phoneSettingPage.updateRegionDialog;
  const title = 'Region';
  const statement = 'Set the country and area code for your region. This will be used for local and emergency dialing and phone number formatting.';
  const saveButton = 'Save';
  const cancelButton = 'Cancel';
  const countryLabel = 'Country';
  const areaCodeLabel = 'Area Code';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click Update button in the Region`, async () => {
    await settingTab.phoneSettingPage.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`And check the popup with title/statement/Area code/buttons`, async () => {
    await updateRegionDialog.checkTitle(title);
    await updateRegionDialog.checkStatement(statement);
    await updateRegionDialog.checkSaveButton(saveButton);
    await updateRegionDialog.checkCancelButton(cancelButton);
    await updateRegionDialog.existCountryLabel(countryLabel);
    await updateRegionDialog.existAreaCodeLabel(areaCodeLabel);
  });
});

//Need account pool support
//For now, use fixed account to run this case
test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1790'],
  maintainers: ['Mia.Cai'],
  keywords: ['GeneralSettings']
})(`Check when the area code is displayed`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog = settingTab.phoneSettingPage.updateRegionDialog;
  const countryListWithAreaCode = ['United States', 'China', 'Mexico'];
  const otherCountryWithoutAreaCode = 'France';

  if (SITE_ENV == 'XMN-UP') {
    loginUser.company.number = '2053800966';
    loginUser.extension = '98001222';
    loginUser.password = 'Test!123';
  } else {
    //GLP-CI1-XMN
    loginUser.company.number = '(207) 464-2517';
    loginUser.extension = '101';
    loginUser.password = 'Test!123';
  }

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click Update button in the Region`, async () => {
    await settingTab.phoneSettingPage.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`And the dial plan shows`, async () => {
    await updateRegionDialog.showCountryDropDown();
  });

  for (let i in countryListWithAreaCode) {
    await h(t).withLog(`When select the country as "${countryListWithAreaCode[i]}"`, async () => {
      // TODO
      await updateRegionDialog.clickCountryDropDown();
      await updateRegionDialog.selectCountryWithText(countryListWithAreaCode[i]);
    });
    await h(t).withLog(`Then Area code input box shows`, async () => {
      await updateRegionDialog.showAreaCode();
    });
  }

  await h(t).withLog(`When Selected a country not US/CA/Puerto Rico/China/Mexico/Australia`, async () => {
    await updateRegionDialog.clickCountryDropDown();
    await updateRegionDialog.selectCountryWithText(otherCountryWithoutAreaCode);
  });

  await h(t).withLog(`Then no Area code input box`, async () => {
    await updateRegionDialog.noAreaCode();
  });

});

//Need account pool support
//For now, use fixed account to run this case
test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1798'],
  maintainers: ['Mia.Cai'],
  keywords: ['GeneralSettings']
})(`Check if the region is implemented when user save/cancel changes on dialog`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  const updateRegionDialog = settingTab.phoneSettingPage.updateRegionDialog;
  const country1 = 'France';
  const country2 = 'China';
  const areaCodeForCountry2 = '10';
  const toast = 'Your region is updated successfully.';

  if (SITE_ENV == 'XMN-UP') {
    loginUser.company.number = '2053800966';
    loginUser.extension = '98001222';
    loginUser.password = 'Test!123';
  } else {
    //GLP-CI1-XMN
    loginUser.company.number = '(207) 464-2517';
    loginUser.extension = '101';
    loginUser.password = 'Test!123';
  }

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  const regionDescriptionDefault = await phoneSettingPage.regionDescription.innerText;
  await h(t).withLog(`And I click Update button in the Region section`, async () => {
    await phoneSettingPage.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`When I change the dial plan/area`, async () => {
    await updateRegionDialog.clickCountryDropDown();
    await updateRegionDialog.selectCountryWithText(country1);
  });

  await h(t).withLog(`And I click cancel button`, async () => {
    await updateRegionDialog.clickCancelButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await updateRegionDialog.noUpdateRegionDialog();
  });

  await h(t).withLog(`And the the default change should keep the same`, async () => {
    await phoneSettingPage.regionDescriptionWithText(regionDescriptionDefault);
  });

  await h(t).withLog(`When I click Update button in the Region section`, async () => {
    await phoneSettingPage.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`When I change the dial plan`, async () => {
    await updateRegionDialog.clickCountryDropDown();
    await updateRegionDialog.selectCountryWithText(country2);
  });

  await h(t).withLog(`And I set valid area code`, async () => {
    await updateRegionDialog.clearInputByKey();
    await updateRegionDialog.setAreaCode(areaCodeForCountry2);
  });

  await h(t).withLog(`Then I can see the changes`, async () => {
    await updateRegionDialog.showCountrySelectedWithText(country2);
    await updateRegionDialog.showAreaCodeWithText(areaCodeForCountry2);
  });

  await h(t).withLog(`When I click save button`, async () => {
    await updateRegionDialog.clickSaveButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await updateRegionDialog.noUpdateRegionDialog();
  });

  await h(t).withLog(`And show a success flash toast "${toast}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(toast);
  });

  await h(t).withLog(`And I can see the changes`, async () => {
    await t.expect(phoneSettingPage.regionDescription.innerText).contains(country2);
    await t.expect(phoneSettingPage.regionDescription.innerText).contains(areaCodeForCountry2);
  });

});
