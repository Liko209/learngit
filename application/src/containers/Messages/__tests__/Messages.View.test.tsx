/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-1-8 13:24:48
 * Copyright © RingCentral. All rights reserved.
 */

// import React from 'react';
// import { shallow } from 'enzyme';
// import { MessagesView } from '../Messages.View';
// import { Notification } from '@/containers/Notification';
// import { Dialog } from '@/containers/Dialog';
// import { JuiButton } from 'jui/components/Buttons';
// import { ERROR_CODES_SERVER, JServerError } from 'sdk/error';
// jest.mock('@/containers/Notification');

// const someProps = {
//   t: (str: string) => {},
// };

// describe('MessagesView', () => {
//   describe('render()', () => {
//     it('should display flash toast notification when join a public team failed. [JPT-720]', (done: jest.DoneCallback) => {
//       const props: any = {
//         ...someProps,
//         joinTeam: () => {
//           throw new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, '');
//         },
//       };
//       Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
//       const wrapper = shallow(<MessagesView {...props} />);
//       expect(wrapper.find('span').text('')).toEqual();
//     });

//     it('should display flash toast notification when join a public team without network. [JPT-721]', (done: jest.DoneCallback) => {
//       const props: any = {
//         ...someProps,
//         isPublic: false,
//         handlePrivacy: () => {
//           throw new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, '');
//         },
//       };
//       Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
//       const wrapper = shallow(<SearchBarView {...props} />);
//       wrapper.find(JuiButton)[0].simulate('click');
//       setTimeout(() => {
//         expect(Notification.flashToast).toHaveBeenCalledWith(
//           expect.objectContaining({
//             message: 'markPrivateServerErrorForTeam',
//           }),
//         );
//         done();
//       },         0);
//     });

//     it('should display flash toast notification when join a public team then permission changed. [JPT-722]', (done: jest.DoneCallback) => {
//       const props: any = {
//         ...someProps,
//         handlePrivacy: () => {
//           throw new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, '');
//         },
//       };
//       Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
//       const wrapper = shallow(<SearchBarView {...props} />);
//       wrapper.find(JuiButton)[0].simulate('click');
//       setTimeout(() => {
//         expect(Notification.flashToast).toHaveBeenCalledWith(
//           expect.objectContaining({
//             message: 'teamNetError',
//           }),
//         );
//         done();
//       },         0);
//     });
//   });
// });
