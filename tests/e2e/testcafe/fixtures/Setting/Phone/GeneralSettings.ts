import { v4 as uuid } from 'uuid';
import { formalName } from '../../../libs/filter';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../../config';
import { number } from 'prop-types';

fixture('Phone/GeneralSettings')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName(`Check the page content of the "General" section`, ['P2', 'JPT-1753', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;

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

  await h(t).withLog(`Then I can see Caller ID/Region/Extension settings in the 'General' section`, async () => {
    // TODO
    // todo
  });

});

test(formalName(`Check the caller id drop down list shows available numbers for the user`, ['P2', 'JPT-1756', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;

  await h(t).withLog(`Given I get login user info`, async () => {
    const res = await h(t).glip(loginUser).getPerson();
    console.log(res);
  });

  const callerIDDropDownList=[];

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

  await h(t).withLog(`Then I can see the default of Caller ID in the 'General' section`, async () => {
    // TODO
    for(let i in callerIDDropDownList){
      await settingTab.phoneTab.callerIDDropDownListWithText(callerIDDropDownList[i], +i)
    }
  });

});

// TODO
test.skip(formalName(`Check if the caller id is implemented correctly`, ['P2', 'JPT-1759', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;

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


});


// Region settings
test(formalName(`Check if the content of region section is displayed correctly;`, ['P2', 'JPT-1788', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog =settingTab.phoneTab.updateRegionDialog;
  const title = 'Home country code';
  const statement = 'Set the country and area code for your region. This will be used for local and emergency dialing and phone number formatting.';
  const saveButton = 'Save';
  const cancelButton = 'Cancel';

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
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`And check the popup with title/statement/Area code/buttons`, async () => {
    await updateRegionDialog.checkTitle(title);
    await updateRegionDialog.checkStatement(statement);
    await updateRegionDialog.checkSaveButton(saveButton);
    await updateRegionDialog.checkCancelButton(cancelButton);
  });
  

});

test(formalName(`Check when the area code is displayed`, ['P2','JPT-1790', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog =settingTab.phoneTab.updateRegionDialog;
  const countryList = ['US','CA','Puerto Ricco'];
  const otherCountry='China';

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
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  await h(t).withLog(`And the dial plan shows`, async () => {
    await updateRegionDialog.showCountryDropDown();
  });

  for(let i in countryList){
    await h(t).withLog(`When select the country as "${countryList[i]}"`, async () => {
      // TODO
      await updateRegionDialog.selectCountry(countryList[i]);
    });
    await h(t).withLog(`Then Area code input box shows`, async () => {
      await updateRegionDialog.showAreaCode();
    });
  }

  await h(t).withLog(`When Selected a country not US/CA/Puerto Ricco`, async () => {
    // TODO
    await updateRegionDialog.selectCountry(otherCountry);
  });

  await h(t).withLog(`Then no Area code input box shows`, async () => {
    await updateRegionDialog.noAreaCode();
  });

});

test(formalName(`Check the dialog status when user save/cancel changes made on dialog`, ['P2', 'JPT-1798', 'GeneralSettings', 'Mia.Cai']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const updateRegionDialog =settingTab.phoneTab.updateRegionDialog;
  const country = 'US';
  const toast = 'Your region is updated successfully';

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
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });

  // get the default country
  const defaultCountry = await updateRegionDialog.countryDropDown.nth(0).innerText;
  await h(t).withLog(`When I change the dial plan/area`, async () => {
    // TODO
    await updateRegionDialog.selectCountryByIndex(1);
  });

  await h(t).withLog(`And I click cancel button`, async () => {
    await updateRegionDialog.clickCancelButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await updateRegionDialog.noUpdateRegionDialog();
  });

  await h(t).withLog(`And I click Update button in the Region`, async () => {
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then the update region popup shows`, async () => {
    await updateRegionDialog.showUpdateRegionDialog();
  });
  
  await h(t).withLog(`And the the default change should keep the same`, async () => {
    const country = await updateRegionDialog.countryDropDown.nth(0).innerText;
    await t.expect(country).eql(defaultCountry);
  });
 
  let areaCode;
  await h(t).withLog(`When I change the dial plan/area`, async () => {
    // TODO
    await updateRegionDialog.selectCountry(country);
    await updateRegionDialog.selectAreaCodeByIndex(1);
    areaCode = updateRegionDialog.areaCode.nth(1).innerText;
  });

  await h(t).withLog(`Then I can see the changes`, async () => {
    await t.expect(updateRegionDialog.countryDropDown.nth(0).innerText).eql(country);
    await t.expect(updateRegionDialog.areaCode.nth(1).innerText).eql(areaCode);
  });

  await h(t).withLog(`When I click save button`, async () => {
    await updateRegionDialog.clickSaveButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await updateRegionDialog.noUpdateRegionDialog();
  });

  await h(t).withLog(`And show a success flash toast "${toast}"`, async () => {
    await updateRegionDialog.checkSuccessToast(toast);
  });

  await h(t).withLog(`When I click Update button again in the Region`, async () => {
    await settingTab.phoneTab.clickRegionUpdateButton();
  });

  await h(t).withLog(`Then I can see the changes`, async () => {
    await t.expect(updateRegionDialog.countryDropDown.nth(0).innerText).eql(country);
    await t.expect(updateRegionDialog.areaCode.nth(1).innerText).eql(areaCode);
  });

});