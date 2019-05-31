import getDocTitle from '../getDocTitle';

jest.mock('@/utils/i18nT', () => (key: string) => key);

jest.mock('@/store/utils', () => ({
  getEntity: (name: string, id: number) => ({
    displayName: 'xxx',
  }),
}));

describe('get doc title', () => {
  describe('get messages title', () => {
    it('should return current title when pathname not have id', async () => {
      const title = await getDocTitle('/messages');
      expect(title).toEqual('message.Messages');
    });

    it('should return current title when pathname have id', async () => {
      const title = await getDocTitle('/messages/1');
      expect(title).toEqual('xxx');
    });
  });

  describe('get others title', () => {
    it('should return current page title title when get diff page', async () => {
      let title = await getDocTitle('/dashboard');
      expect(title).toEqual('dashboard.Dashboard');
      title = await getDocTitle('/messages');
      expect(title).toEqual('message.Messages');
      title = await getDocTitle('/settings');
      expect(title).toEqual('setting.Settings');
    });

    it('should return current page section title title when get diff page section', async () => {
      let title = await getDocTitle('/settings/messages');
      expect(title).toEqual('setting.Settings - setting.messages.title');
      title = await getDocTitle('/settings/general');
      expect(title).toEqual('setting.Settings - setting.general.title');
      title = await getDocTitle('/settings/notification_and_sounds');
      expect(title).toEqual(
        'setting.Settings - setting.notificationAndSounds.title',
      );
    });
  });
});
