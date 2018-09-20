// import { waitForReact } from 'testcafe-react-selectors';
// /*
//  * @Author: Devin Lin (devin.lin@ringcentral.com)
//  * @Date: 2018-09-17 15:10:12
//  * Copyright © RingCentral. All rights reserved.
//  */

// import { formalName } from '../../libs/filter';
// import { setUp, tearDown, TestHelper } from '../../libs/helpers';
// import { directLogin } from '../../utils';
// import { setupSDK } from '../../utils/setupSDK';
// import { Draft } from '../../page-models/components/MessageInput';
// import { ClientFunction } from 'testcafe';

// fixture('send messages support draft')
//   .beforeEach(setUp('GlipBetaUser(1210,4488)'))
//   .afterEach(tearDown());

// const createPrivateChat = async (h: TestHelper, members: any[]) => {
//   const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
//   const privateChat = await client701.createGroup({
//     members,
//     type: 'PrivateChat',
//     isPublic: true,
//     description: 'test',
//   });
//   h.log(`   Private chat ${privateChat.data.id} is created.`);
//   return privateChat;
// };

// const setEditorText = ClientFunction((msg) => {
//   console.log('77777', msg);
//   const editor = document.getElementsByClassName('ql-editor') as any;
//   if (editor && editor.length > 0) {
//     editor[0].innerHTML = msg;
//     console.log('12334433', editor[0].innerHTML);
//   }
//   console.log('6544444', editor);
//   return true;
// });

// const getEditorText = ClientFunction(() => {
//   const editor = document.getElementsByClassName('ql-editor') as any;
//   if (editor && editor.length > 0) {
//     console.log('98765432', editor[0].innerText);
//     return editor[0].innerText;
//   }
//   console.log('87654', editor);
//   return '';
// });

// test(formalName('draft', ['P1', 'JPT-149', 'draft']), async (t) => {
//   await setupSDK(t);
//   let groupId1: number;
//   let groupId2: number;

//   const msg = '123123';

//   let page = directLogin(t);

//   await (page = page
//     .log('1. create two private chat conversations')
//     .chain(async (t, h) => {
//       const privateChat1 = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user702.rc_id]);
//       const privateChat2 = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user703.rc_id]);
//       groupId1 = privateChat1.data.id;
//       groupId2 = privateChat2.data.id;
//     }));

//   await page.log(`2. navigate to conversation ${groupId1}`)
//     .chain(async t => await t.wait(10e3))
//     .navigateTo(`/messages/${groupId1}`)
//     .log('3. set conversation value')
//     .shouldNavigateTo(Draft)
//     .ensureLoaded()
//     .chain(async t => await t.debug())
//     .setText(msg)
//     // .chain(async (t, h) => {
//     //   console.log(555555555);
//     //   await t.wait(5000);
//     //   const success = setEditorText(msg);
//     //   await t.expect(success).eql(true);
//     // })
//     .log(`4. navigate to other conversation ${groupId2}`)
//     .navigateTo(`/messages/${groupId2}`)
//     .log(`5. back to conversation ${groupId1}`)
//     .navigateTo(`/messages/${groupId1}`)
//     .chain(async (t, h) => {
//       console.log(666666);
//       await t.wait(5000);
//       const response = getEditorText();
//       await t.expect(response).contains(msg).debug();
//     });

// });
