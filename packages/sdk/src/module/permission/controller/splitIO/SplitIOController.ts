// /*
//  * @Author: Lip Wang (lip.wang@ringcentral.com)
//  * @Date: 2019-01-21 13:27:24
//  * Copyright © RingCentral. All rights reserved.
//  */
// import { AccountGlobalConfig } from '../../../../service/account/config';

// import { SplitIOClient } from './SplitIOClient';
// import UserPermissionType from '../../types';
// import { Api } from '../../../../api';
// import SplitIODefaultPermissions from './SplitIODefaultPermissions';
// import { notificationCenter, SERVICE } from '../../../../service';
// import { mainLogger } from 'foundation';

// class SplitIOController {
//   private splitIOClient: SplitIOClient;
//   private isClientReady: boolean = false;
//   private splitIOUpdateCallback: () => void;
//   constructor(callback: () => void) {
//     this.splitIOUpdateCallback = callback;
//     this._subscribeNotifications();
//   }

//   async hasPermission(type: UserPermissionType): Promise<boolean> {
//     return this.isClientReady
//       ? this.splitIOClient.hasPermission(type)
//       : this._defaultPermission(type);
//   }

//   private _subscribeNotifications() {
//     notificationCenter.on(SERVICE.LOGIN, () => {
//       this._initClient();
//     });
//     notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
//       this._initClient();
//     });
//     notificationCenter.on(SERVICE.LOGOUT, () => {
//       this.splitIOClient && this.splitIOClient.shutdown();
//       this.isClientReady = false;
//     });
//   }

//   private _defaultPermission(type: UserPermissionType) {
//     return !!SplitIODefaultPermissions[type];
//   }

//   private _initClient() {
//     if (this.isClientReady) {
//       return;
//     }
//     const userId: number = AccountGlobalConfig.getCurrentUserId();
//     const companyId: number = AccountGlobalConfig.getCurrentCompanyId();
//     if (!userId || !companyId) {
//       return;
//     }
//     const params = {
//       userId: userId.toString(),
//       attributes: {
//         companyId,
//       },
//       authKey: Api.httpConfig.splitio.clientSecret,
//       permissions: Object.keys(SplitIODefaultPermissions),
//       splitIOReady: (): void => {
//         this.isClientReady = true;
//         this.splitIOUpdateCallback && this.splitIOUpdateCallback();
//         mainLogger.log('incoming event splitIOReady');
//       },
//       splitIOUpdate: (): void => {
//         this.splitIOUpdateCallback && this.splitIOUpdateCallback();
//         mainLogger.log('incoming event splitIOUpdate');
//       },
//     };
//     this.splitIOClient = new SplitIOClient(params);
//   }
// }

// export { SplitIOController };
