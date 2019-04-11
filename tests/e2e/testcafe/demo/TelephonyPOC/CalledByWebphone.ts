/*
 * @Author: Alex Zheng (alex.zheng@ringcentral.com)
 * @Date: 2019-02-10 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */
import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Telephony')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Called by another extension from webphone', ['P0', 'MakeCall']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const callee = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I call this extension`, async () => {
    const session = await h(t).webphone(callee);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await t.wait(10e3);
    await session.close();
  });

});
