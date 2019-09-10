import { getDocTitle } from '../getDocTitle';

jest.mock('@/utils/i18nT', () => ({
  i18nP: (key: string) => key,
}));

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

  describe('get phone title', () => {
    it('should return current title when pathname not have id', async () => {
      const title = await getDocTitle('/phone');
      expect(title).toEqual('telephony.Phone');
    });

    it('should return current title when pathname have id', async () => {
      const title = await getDocTitle('/phone/callhistory');
      expect(title).toEqual('telephony.Phone - phone.tab.callHistory');
    });

    it('should return current title when pathname have id', async () => {
      const title = await getDocTitle('/phone/voicemail');
      expect(title).toEqual('telephony.Phone - phone.voicemail');
    });
  });

  describe('get contacts title [JPT-2799]', () => {
    it('should return all contacts when go to all contacts', async () => {
      const title = await getDocTitle('/contacts/all-contacts');
      expect(title).toEqual('contact.Contacts - contact.tab.allContacts');
    });

    it('should return company when go to company', async () => {
      const title = await getDocTitle('/contacts/company');
      expect(title).toEqual('contact.Contacts - contact.tab.company');
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
      expect(title).toEqual('setting.Settings - setting.messages');
      title = await getDocTitle('/settings/general');
      expect(title).toEqual('setting.Settings - setting.general');
      title = await getDocTitle('/settings/notification_and_sounds');
      expect(title).toEqual(
        'setting.Settings - setting.notificationAndSounds.title',
      );
    });
  });

  describe('get undefined title', () => {
    it('should get empty title when route not defined url', async () => {
      expect(await getDocTitle('/xxxx')).toEqual('');
    });
  });
});
