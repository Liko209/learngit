/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-13 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { directLogin } from '../../utils';
import { setUp, tearDown } from '../../libs/helpers';
import { formalName } from '../../libs/filter';
import { BackNForward } from '../../page-models/pages/BackNForward';
import { ClientFunction } from 'testcafe';

declare var test: TestFn;
fixture('BackNForward/BackNForward')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName('test navigation on electron backwards and forwards functions', ['P2', 'JPT-44', 'JPT-49', 'BackNForward']), async (t) => {
    const page = directLogin(t);
    await page.chain(t => t.wait(10000))
      .log('1. Navigate to BackNForward')
      .shouldNavigateTo(BackNForward)
      .log('2. click Phone Nav')
      .clickLeftNavBtn('phone')
      .log('3. click Meetings Nav')
      .clickLeftNavBtn('meetings')
      .log('4. click Contacts Nav')
      .clickLeftNavBtn('contacts')
      .log('5. Click Calendar Nav')
      .clickLeftNavBtn('calendar')
      .log('6. Click backward btn')
      .clickBackwardBtn();
    const getLocation = ClientFunction(() => document.location.pathname);
    await t.expect(getLocation()).contains('/contacts');
    await page.log('7. click forward btn')
      .shouldNavigateTo(BackNForward)
      .clickForwardBtn();
    await t.expect(getLocation()).contains('/calendar');
    await page.shouldNavigateTo(BackNForward)
      .log('8. click avatar to sign out')
      .clickAvatar()
      .clickSignOut();
  });

test(
  formalName('reLogin should disable backward and forward button', ['P2', 'JPT-50', 'BackNForward']), async (t) => {
    const page = directLogin(t);
    await page.chain(t => t.wait(10000))
      .log('1. Navigate to BackNForward')
      .shouldNavigateTo(BackNForward)
      .log('2. expect re-login backward btn disabled')
      .backwardNForwardBtnShouldBeDisabled();
  });

test(
  formalName('reLoad should disable backward and forward button', ['P2', 'JPT-172', 'BackNForward']), async (t) => {
    const page = directLogin(t);
    await page.chain(t => t.wait(10000))
      .log('1. Navigate to BackNForward')
      .shouldNavigateTo(BackNForward)
      .log('2. click Phone Nav')
      .clickLeftNavBtn('phone')
      .log('3. click Meetings Nav')
      .clickLeftNavBtn('meetings')
      .log('4. click Contacts Nav')
      .clickLeftNavBtn('contacts')
      .log('5. Click backward btn')
      .clickBackwardBtn()
      .log('6. Reload app');
    const current_url = await t.eval(() => window.location.href);
    await t.navigateTo(current_url);
    page.log('7. expect re-login backward btn disabled').shouldNavigateTo(BackNForward)
      .backwardNForwardBtnShouldBeDisabled();
  });
