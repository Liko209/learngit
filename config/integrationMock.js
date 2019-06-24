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
