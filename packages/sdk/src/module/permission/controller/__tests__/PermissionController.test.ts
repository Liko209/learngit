// /*
//  * @Author: Lip Wang (lip.wang@ringcentral.com)
//  * @Date: 2019-01-22 15:49:27
//  * Copyright © RingCentral. All rights reserved.
//  */
// import { PermissionController } from '../PermissionController';
// import { SplitIOController } from '../splitIO/SplitIOController';
// jest.mock('../splitIO/SplitIOController');
// describe('PermissionController', () => {
//   describe('constructor', () => {
//     it('should create splitIOController instance', () => {
//       const controller = new PermissionController();
//       expect(controller['splitIOController']).toBeInstanceOf(SplitIOController);
//     });
//   });
//   describe('getById', () => {
//     it('should return user permission', async () => {
//       const controller = new PermissionController();
//       const mockValue = {
//         JUPITER_CREATE_TEAM: true,
//         JUPITER_SEND_NEW_MESSAGE: false,
//       };
//       jest
//         .spyOn(controller, '_getAllPermissions')
//         .mockResolvedValueOnce(mockValue);
//       const result = await controller.getById(1);
//       expect(result.id).toEqual(1);
//       expect(result.permissions).toEqual(mockValue);
//     });
//   });
// });

describe('', () => {
  it('', () => {});
});
