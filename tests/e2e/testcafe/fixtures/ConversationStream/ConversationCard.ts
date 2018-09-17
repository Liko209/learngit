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
    .log('1. should navigate to Left Rail')
    .shouldNavigateTo(LeftRail)
    .log('2. select any conversation')
    .selectRandomConversation()
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
    'ConversationStream',
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
    ['JPT-91', 'P2', 'ConversationStream'],
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
      .checkNameOnPost(`${changedName} Doe701`)
      .log('9. change user name back')
      .chain(async (t, h) => {
        await (PersonAPI as any).putDataById(Number(h.users.user701.glip_id), {
          first_name: 'John',
          last_name: 'Doe701',
        });
      })
      .log('10. name should be updated')
      .checkNameOnPost('John Doe701');
  },
);

test(
  formalName(
    'When update custom status, can sync dynamically in message metadata.',
    ['JPT-95', 'P2', 'ConversationStream'],
  ),
  async (t: TestController) => {
    await setupSDK(t);
    const postContent = `some random text post ${Date.now()}`;
    await prepare(t, postContent)
      .log('6. check current user name without away status')
      .checkNameOnPost('John Doe701')
      .log('7. set user away status to "in the meeting"')
      .chain(async (t, h) => {
        await (PersonAPI as any).putDataById(Number(h.users.user701.glip_id), {
          away_status: 'in a meeting',
        });
      })
      .log('8. title should be updated with away status')
      .checkNameOnPost('John Doe701 in a meeting')
      .log('9. set user away status to "content of user modify"')
      .chain(async (t, h) => {
        await (PersonAPI as any).putDataById(Number(h.users.user701.glip_id), {
          away_status: 'content of user modify',
        });
      })
      .log('10. title should be updated with away status')
      .checkNameOnPost('John Doe701 content of user modify')
      .log('11. delete user away status')
      .chain(async (t, h) => {
        await (PersonAPI as any).putDataById(Number(h.users.user701.glip_id), {
          away_status: null,
        });
      })
      .log('12. title should be updated to without away status')
      .checkNameOnPost('John Doe701');
  },
);
