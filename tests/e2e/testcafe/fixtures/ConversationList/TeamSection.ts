/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper  } from '../../libs/helpers';
import { login } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';

fixture('teamSection')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());
const randomTeamName = 'Team' + Number(new Date());
test(formalName(
  'Team section display the conversation which the login user as one of the team member',
  ['P0', 'ConversationList']),
     async (t) => {
       await setupSDK(t);
       await login(t)
      .createTeamByAPI(Number(t.ctx.data.users.user701.glip_id), randomTeamName)
      .nthTeamNameEquals(0, randomTeamName)
      .modifyTeamNameByApi(randomTeamName + 1)
      .nthTeamNameEquals(0, randomTeamName + 1);
     },
);
