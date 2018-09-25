/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-09-12 16:29:39
* Copyright © RingCentral. All rights reserved.
*/
import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { LeftRail } from '../../page-models/components/ConversationList/LeftRail';
import { ConversationStream } from '../../page-models/components/ConversationStream/ConversationStream';
import { PersonAPI } from '../../libs/sdk';

declare var test: TestFn;
fixture('ConversationCard')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

const prepare = (t: TestController, postContent: string) =>
  directLogin(t)
    .chain(t => t.wait(10000))
    .log('1. should navigate to Left Rail')
    .shouldNavigateTo(LeftRail)
    .chain(t => t.wait(3000))
    .log('2. select any conversation')
    .selectRandomConversation()
    .chain(t => t.wait(1000))
    .log('3. navigate to conversation stream')
    .shouldNavigateTo(ConversationStream)
    .shouldMatchURL()
    .log('4. send post to current group')
    .sendPost2CurrentGroup(postContent, 'jpt5Post')
    .log('5. find the post just sent')
    .shouldFindPostById('jpt5Post');

test(
  formalName('Check send time for each message metadata.', [
    'JPT-43',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    await setupSDK(t);
    const postContent = `some random text post ${Date.now()}`;
    await prepare(t, postContent)
      .log('6. should have right format time in card')
      .checkTimeFormatOnPost('jpt5Post', 'hh:mm A');
  },
);

test(
  formalName(
    'When update user name, can sync dynamically in message metadata.',
    ['JPT-91', 'P2', 'ConversationList'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const postContent = `some random text post ${Date.now()}`;
    const changedName = `Random ${Date.now()}`;
    await prepare(t, postContent)
      .log('6. check current user name')
      .checkNameOnPost('John Doe701')
      .log('7. modify user name through api request')
      .chain(async (t, h) => {
        await (PersonAPI as any).putDataById(Number(h.users.user701.glip_id), {
          first_name: changedName,
        });
      })
      .log('8. name should be updated')
      .checkNameOnPost(`${changedName} Doe701`);
  },
);
