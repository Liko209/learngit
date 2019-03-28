// /*
//  * @Author: Lip Wang (lip.wang@ringcentral.com)
//  * @Date: 2019-01-22 16:24:47
//  * Copyright © RingCentral. All rights reserved.
//  */
// import { SplitIOClient } from '../SplitIOClient';
// import { SplitIOController } from '../SplitIOController';
// import { notificationCenter } from '../../../../../service';
// import UserPermissionType from '../../../types';

// jest.mock('../SplitIOClient');
// jest.mock('../../../../../service');

// SplitIOClient.prototype.hasPermission = async (type: UserPermissionType) => {
//   const result = (await type) === UserPermissionType.JUPITER_CREATE_TEAM;
//   return result;
// };

// describe('SplitIOController', () => {
//   describe('constructor', () => {
//     it('should call notificationCenter.on three times', () => {
//       new SplitIOController(() => {});
//       expect(notificationCenter.on).toHaveBeenCalledTimes(3);
//     });
//   });
//   describe('hasPermission', () => {
//     it('should return local default value when SplitIO is not ready', async () => {
//       const controller = new SplitIOController(() => {});
//       const permission = await controller.hasPermission(
//         UserPermissionType.JUPITER_CREATE_TEAM,
//       );
//       expect(permission).toBeTruthy();
//     });
//     it('should return SplitIO value when SplitIO is ready', async () => {
//       const controller = new SplitIOController(() => {});
//       Object.assign(controller, {
//         isClientReady: true,
//         splitIOClient: new SplitIOClient({}),
//       });
//       let result = await controller.hasPermission(
//         UserPermissionType.JUPITER_CREATE_TEAM,
//       );
//       expect(result).toBeTruthy();
//       result = await controller.hasPermission(
//         UserPermissionType.JUPITER_SEND_NEW_MESSAGE,
//       );
//       expect(result).toBeFalsy();
//     });
//   });
// });
describe('', () => {
  it('', () => {});
});
