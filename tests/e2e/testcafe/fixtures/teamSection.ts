/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/BlankPage';
import { EnvironmentSelectionPage } from '../page-models/EnvironmentSelectionPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';
import { SITE_URL, SITE_ENV } from '../config';

import { formalName } from '../libs/filter';
import { setUp, tearDown, TestHelper } from '../libs/helpers';
import { MessagePage } from '../page-models/MessagePage';

fixture('teamSection')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());
const randomTeamName = 'Team' + Number(new Date());
test(formalName(
  'Team section display the conversation which the login user as one of the team member',
  ['P0', 'ConversationList']),
     async t => {
       const helper = TestHelper.from(t);
       await  new BlankPage(t)
      .open(SITE_URL)
      .shouldNavigateTo(EnvironmentSelectionPage)
      .selectEnvironment(SITE_ENV)
      .toNextPage()
      .shouldNavigateTo(RingcentralSignInNavigationPage)
      .setCredential(helper.companyNumber)
      .toNextPage()
      .shouldNavigateTo(RingcentralSignInPage)
      .setExtension(helper.users.user701.extension)
      .setPassword(helper.users.user701.password)
      .signIn()
      .shouldNavigateTo(MessagePage)
      .setupSDK({
        username:helper.companyNumber,
        extension:helper.users.user702.extension,
        password: helper.users.user702.password,
      })
      .createTeamByAPI(Number(helper.users.user702.glip_id), randomTeamName)
      .nthTeamNameEquals(1, randomTeamName)
      .modifyTeamNameByApi(1, randomTeamName + 1)
      .nthTeamNameEquals(1, randomTeamName + 1);
     },
);
