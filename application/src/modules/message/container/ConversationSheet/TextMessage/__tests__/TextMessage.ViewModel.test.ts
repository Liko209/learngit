/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { ENTITY_NAME } from '@/store';
import { TextMessageViewModel } from '../TextMessage.ViewModel';
import * as telephony from '@/modules/telephony/module.config';
import * as featuresFlags from '@/modules/featuresFlags/module.config';
import * as commonModule from '@/modules/common/module.config';
import { Jupiter, container } from 'framework';
import * as utils from '@/store/utils';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import Backend from 'i18next-xhr-backend';
import jsonFile from '../../../../../../../public/locales/en/translations.json';
import i18next from 'i18next';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@/utils/i18nT', () => (str: string) => Promise.resolve(str));
jest.mock('@/store/utils');
jest.mock('sdk/module/config/service/UserConfigService');
jest.mock('sdk/module/account/config/AuthUserConfig');
jest.mock('@/modules/message/container/ConversationSheet/PhoneLink', () => ({
  PhoneLink: (props: any) => 'MockPhoneNumberLink: ' + props.children,
}));
jest.mock('jui/components/AtMention', () => ({
  JuiAtMention: (props: any) => 'MockJuiAtMention: ' + props.name,
}));
// const GROUP_ID = 52994050;
// const TEAM_ID = 11370502;
// const PERSON_ID = 2514947;

const mockPostData = {
  text: 'Post text',
  atMentionNonItemIds: [11370502],
};

const mockGroupData = {
  displayName: 'Team name',
};

const mockPersonData = {
  userDisplayName: 'Person name',
};

const mockMap = {
  [ENTITY_NAME.POST]: mockPostData,
  [ENTITY_NAME.GROUP]: mockGroupData,
  [ENTITY_NAME.PERSON]: mockPersonData,
};

let vm: TextMessageViewModel;
const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(featuresFlags.config);
jupiter.registerModule(commonModule.config);
const phoneNumber = '(650)419-1505';
describe('TextMessageViewModel', () => {
  beforeAll(() => {
    AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
      endpoint_id: 1234,
    });
    jest.resetAllMocks();
    (utils.getEntity as jest.Mock).mockImplementation((name, id) => {
      return mockMap[name];
    });
  });

  beforeEach(() => {
    AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
      endpoint_id: 12345,
    });
    vm = new TextMessageViewModel({ id: 123 });
    jest.spyOn(vm, 'getGroup');
    jest.spyOn(vm, 'getPerson');
  });
  it('should called directCall while directCall called', () => {
    const telephonyService: TelephonyService = container.get(TELEPHONY_SERVICE);
    telephonyService.directCall = jest.fn();
    vm.directCall('12345678');
    expect(telephonyService.directCall).toHaveBeenCalledTimes(1);
  });
  it('should update canUseTelephony while called updateCanUseTelephony', () => {
    const featuresFlagsService: FeaturesFlagsService = container.get(
      FeaturesFlagsService,
    );
    featuresFlagsService.canUseTelephony = jest.fn();
    vm.canUseTelephony();
    expect(featuresFlagsService.canUseTelephony).toHaveBeenCalledTimes(1);
  });
  describe('html', () => {
    beforeAll(() => {
      AuthUserConfig.prototype.getRCToken.mockReturnValueOnce({
        endpoint_id: 1234,
      });
    });
    it('should be get url format text when text has link', async () => {
      mockPostData.text = 'https://www.baidu.com';
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(
        `<a href="https://www.baidu.com" target="_blank" rel="noreferrer">https://www.baidu.com</a>`,
      );
    });

    it('should be get email format text when text has email', async () => {
      mockPostData.text = 'xxx@163.com';
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(
        `<a href="mailto:xxx@163.com" target="_blank" rel="noreferrer">xxx@163.com</a>`,
      );
    });

    it('should be get bold font format text when there are two asterisks before and after', async () => {
      mockPostData.text = '**awesome**';
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe('<b>awesome</b>');
    });
    it('should return hyperlink while get valid links', async () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);

      mockPostData.text = `${phoneNumber}`;
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(`MockPhoneNumberLink: ${phoneNumber}`);
    });
    it('Numbers in meeting invite links should be ignored hyperlinked [JPT-1816]', async () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const videoCallPost = `Dial-in Number: ${phoneNumber}`;
      mockPostData.text = videoCallPost;
      i18next.use(Backend).init(
        {
          lng: 'en',
          debug: true,
          resources: {
            en: {
              translation: jsonFile,
            },
          },
        },
        (err, t) => {},
      );
      i18next.loadLanguages('en', () => {});
      // const renderVideoCall = `Dial-in Number: ${phoneLink}`;
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toMatch(`Dial-in Number: MockPhoneNumberLink: ${phoneNumber}`);
    });
  });

  describe('at mentions for person', () => {
    const atMentionNonItemIds = [2514947];
    const text =
      "<a class='at_mention_compose' rel='{\"id\":2514947}'>@Thomas Yang</a>";

    it('should be get person name link when at mention a person', async () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(false);
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(`MockJuiAtMention: Person name`);
      expect(vm.getGroup).toHaveBeenCalledTimes(0);
      expect(vm.getPerson).toHaveBeenCalledTimes(1);
    });

    it('should be get new person name link when person name be changed', async () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      mockPersonData.userDisplayName = 'New person name';
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(`MockJuiAtMention: New person name`);
    });
  });

  describe('at mentions for team', () => {
    const atMentionNonItemIds = [11370502];
    const text = `<a class='at_mention_compose' rel='{"id":11370502}'>@Jupiter profile mini card</a>`;

    it('should be get team name link when at mention a team', async () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(`MockJuiAtMention: ${mockGroupData.displayName}`);
      expect(vm.getGroup).toHaveBeenCalledTimes(1);
      expect(vm.getPerson).toHaveBeenCalledTimes(0);
    });

    it('should be get new team name link when team name be changed', async () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      mockGroupData.displayName = 'New team name';
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(`MockJuiAtMention: ${mockGroupData.displayName}`);
    });
  });

  describe('at mentions for unknown item (not a team/person)', () => {
    const atMentionNonItemIds = [123];
    const originalText = 'Jupiter profile mini card';
    const text = `<a class='at_mention_compose' rel='{"id":123}'>@${originalText}</a>`;

    it('should be get original text when at mention an unknown item', async () => {
      mockPostData.text = text;
      mockPostData.atMentionNonItemIds = atMentionNonItemIds;
      expect(
        renderToStaticMarkup((await vm.getContent()) as React.ReactElement),
      ).toBe(`MockJuiAtMention: @${originalText}`);

      expect(vm.getGroup).toHaveBeenCalledTimes(0);
      expect(vm.getPerson).toHaveBeenCalledTimes(0);
    });
  });
});
