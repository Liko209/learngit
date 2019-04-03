import getDocTitle from '../getDocTitle';

jest.mock('i18next', () => ({
  t: (title: string) => title,
}));

jest.mock('@/store/utils', () => ({
  getEntity: (name: string, id: number) => ({
    displayName: 'xxx',
  }),
}));

describe('get doc title', () => {
  it('should return current title when pathname not have id', () => {
    let title = getDocTitle('/dashboard');
    expect(title).toEqual('dashboard.Dashboard');
    title = getDocTitle('/messages');
    expect(title).toEqual('message.Messages');
  });

  it('should return current title when pathname have id', () => {
    const title = getDocTitle('/messages/1');
    expect(title).toEqual('xxx');
  });
});
