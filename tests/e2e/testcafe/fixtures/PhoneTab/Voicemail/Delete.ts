/*
 * @Author: Potar.He
 * @Date: 2019-06-06 09:53:59
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2019-06-26 09:12:52
 */

import { BrandTire, SITE_URL } from '../../../config';
import { setupCase, teardownCase } from '../../../init';
import { h } from '../../../v2/helpers';
import { ITestMeta } from '../../../v2/models';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { WebphoneSession } from 'webphone-client';


import * as assert from 'assert'
import { ensuredOneVoicemail } from './utils';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2234'],
  maintainers: ['Potar.He'],
  keywords: ['voicemail']
})('Delete the voicemail', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[4];
  const caller = users[5];

  const title = "Delete voicemail"
  const text = "Are you sure you want to delete the voicemail?"
  const cancelButtonText = "Cancel"
  const deleteButtonText = "Delete"

  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
  });

  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  await h(t).withLog('When I click Phone entry of leftPanel and click voicemail entry', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.phoneTab.voicemailEntry.enter();
  });

  await h(t).withLog('Then voicemail page should be open', async () => {
    await voicemailPage.ensureLoaded();
  });

  const telephoneDialog = app.homePage.telephonyDialog;
  if (await telephoneDialog.exists) {
    await telephoneDialog.clickMinimizeButton()
  }

  await ensuredOneVoicemail(t, caller, callee, app);


  const voicemailItem = voicemailPage.voicemailItemByNth(0);
  const voicemailId = await voicemailItem.id;
  await h(t).withLog('When I open voicemail {id} Menu and click "delete voicemail" button', async (step) => {
    step.setMetadata('id', voicemailId)
    await voicemailItem.openMoreMenu();
    await voicemailItem.clickDeleteButton();
  });

  const deleteVoicemailDialog = app.homePage.deleteVoicemailDialog;
  await h(t).withLog('Then the delete confirm dialog should be showed', async () => {
    await deleteVoicemailDialog.ensureLoaded();
  });

  await h(t).withLog('And title: {title}', async (step) => {
    step.setMetadata('title', title)
    await t.expect(deleteVoicemailDialog.title.textContent).eql(title);
  });

  await h(t).withLog('And text: {text}', async (step) => {
    step.setMetadata('text', text)
    await t.expect(deleteVoicemailDialog.content.textContent).eql(text);
  });

  await h(t).withLog('And cancel button: {cancel}', async (step) => {
    step.setMetadata('cancel', cancelButtonText)
    await t.expect(deleteVoicemailDialog.cancelButton.textContent).eql(cancelButtonText);
  });

  await h(t).withLog('And cancel button: {delete}, color: {red}', async (step) => {
    step.initMetadata({ delete: deleteButtonText, red: 'red' })
    await t.expect(deleteVoicemailDialog.deleteButton.textContent).eql(deleteButtonText);
    const style = await deleteVoicemailDialog.deleteButton.style;
    assert.ok(style['background-color'] == 'rgb(244, 67, 54)', ` delete button background not eql specify: rgb(244, 67, 54)`)
  })

  await h(t).withLog('When I click delete button ', async () => {
    await deleteVoicemailDialog.clickDeleteButton();
  });

  await h(t).withLog('Then the delete confirm dialog should dismiss', async () => {
    await deleteVoicemailDialog.ensureDismiss();
  });

  await h(t).withLog('And the voicemail should be deleted', async () => {
    await voicemailPage.voicemailItemById(voicemailId).ensureDismiss();
  });

});
