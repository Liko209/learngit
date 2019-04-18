/*
 * @Author: Alexander Zaverukha (alexander.zaverukha@ringcentral.com)
 * @Date: 2019-04-17 10:14:54
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Telephony/ToVoiceMail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Can should the tooltip when hovering on the to voicemail button', ['JPT-1599', 'P2', 'VoiceMail', 'alexander.zaverukha']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const tooltipText = 'Send to voicemail';
  const callerWebPhone = await h(t).webphone(caller);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I hover on the to voicemail button', async () => {
    await telephonyDialog.hoverSendToVoiceMailButton();
  });

  await h(t).withLog(`Then Display a tooltip: '${tooltipText}`, async () => {
    await telephonyDialog.showTooltip(tooltipText);
  });
  await callerWebPhone.close();
});

test(formalName('User can receive the new incoming call  when user ignored the incoming call', ['JPT-1510', 'P2', 'VoiceMail', 'ali.naffaa']), async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const caller = h(t).rcData.mainCompany.users[1];
    const app = new AppRoot(t);
    const loginUserWebPhone = await h(t).webphone(loginUser);
    let callerWebPhone = undefined;

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`And I also login in another platform (webphone) ${caller.company.number}#${caller.extension}`, async () => {
      callerWebPhone = await h(t).webphone(caller);
    });

    const telephonyDialog = app.homePage.telephonyDialog;
    await h(t).withLog('When I receive an in-comming call', async () => {
      await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });

    await h(t).withLog('And I ignore this in-comming call in Jupiter', async () => {
      await telephonyDialog.ensureLoaded();
      await telephonyDialog.clickIgnoreButton();
    });

    await h(t).withLog('Then this call should be ignored in Jupiter', async () => {
      await telephonyDialog.ensureDismiss();
    });

    await h(t).withLog('But in the other platform (webPhone) this call should still ringing', async () => {
      await loginUserWebPhone.update();
      const actual = loginUserWebPhone.status;

      await t.expect(actual).eql('invited');
    });

    await loginUserWebPhone.close();
    await callerWebPhone.close();
  },
);
