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
// jest.mock('@/containers/ThemeProvider');
jest.mock('jui/components/Tabs/Tabs');
jest.mock('jui/components/AutoSizer/AutoSizer');
jest.mock('jui/components/VirtualizedList/InfiniteList');
jest.mock('jui/hoc/withDelay/withDelay');

// jest.mock('jui/foundation/Iconography/Iconography');
// jest.mock('jui/components/Buttons/IconButton/IconButton');
