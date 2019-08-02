/* eslint-disable global-require */
jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => ({
  fetchWhiteList: jest.fn().mockReturnValue({}),
}));
jest.mock('foundation/network/client/http/Http', () =>
  require('shield/sdk/mocks/Http'),
);
jest.mock('foundation/network/client/socket/Socket', () =>
  require('shield/sdk/mocks/Socket'),
);
jest.mock('foundation/network/client/socket/socket.io.js', () =>
  require('shield/sdk/mocks/socket.io.js'),
);
jest.mock('../packages/voip/src/signaling/RTCSipUserAgent');

jest.mock('@/modules/common/util/lazyComponent');
jest.mock('@/containers/ThemeProvider');
jest.mock('jui/components/Tabs/Tabs');
jest.mock('jui/components/AutoSizer/AutoSizer');
jest.mock('jui/components/VirtualizedList/InfiniteList');
jest.mock('jui/hoc/withDelay/withDelay');

// // Create a localStorage and sessionStorage at window
// class FakeStorage {
//   store = {};
//   getItem(key) {
//     return this.store[key] || null;
//   }
//   setItem(key, value) {
//     this.store[key] = value.toString();
//   }
//   removeItem(key) {
//     delete this.store[key];
//   }
//   clear() {
//     this.store = {};
//   }
//   get length() {
//     return Object.keys(this.store).length;
//   }
// }

// Object.defineProperty(window, 'localStorage', {
//   value: new FakeStorage(),
// });

// Object.defineProperty(window, 'sessionStorage', {
//   value: new FakeStorage(),
// });

global.fetch = require('jest-fetch-mock');

global.Notification = {
  requestPermission: jest.fn(),
  permission: 'default',
};
// jest.mock('jui/foundation/Iconography/Iconography');
// jest.mock('jui/components/Buttons/IconButton/IconButton');
