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
  const tooltipText = "Send to voicemail";

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I call this extension`, async () => {
    const session = await h(t).webphone(caller);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await session.close();
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

});
