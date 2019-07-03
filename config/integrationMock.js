jest.mock('sdk/utils/phoneParser');
jest.mock('sdk/framework/account/helper', () => {
  return {
    fetchWhiteList: jest.fn().mockReturnValue({}),
  };
});
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
jest.setTimeout(30 * 1000);
