/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-04-30 09:07:10
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { mount } from 'enzyme';
import { CommonPhoneLink } from '../parserNumber';
import { Jupiter, container } from 'framework';
import * as telephony from '@/modules/telephony/module.config';
import * as featuresFlags from '@/modules/featuresFlags/module.config';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/__tests__/utils';
import * as utils from '@/store/utils';
import { JuiConversationNumberLink } from 'jui/pattern/ConversationCard';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';

const NUMBER_WITH_DASH = '650-740-5231';
const NUMBER_LESS_THAN_SEVEN = '123456';
const NUMBER_MORE_THAN_FIFTEEN = '1234567812345678';
const NUMBER_IN_STRING = '123456789abcd';
const NUMBER_WITH_SINGLE_BLANK = '650 741 5231';
const NUMBER_WITH_BRACKETS = '(650)741-234-3456';
const NUMBER_BRACKETS_WITH_LONG = '(650)741-1212-456789';
const MESSAGE_WITH_PLUS = '+123456789,asdas';
const MESSAGE_WITH_STRING_AND_NUMBER = '650 740 5234  sadssdada';
const MESSAGE_WITH_SPECIAL_CHAR = '+1(650)399-0766';

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);
jupiter.registerModule(featuresFlags.config);
jest.mock('sdk/module/account/config');
jest.mock('../../../../telephony/service');

const mountWithTheme = (content: React.ReactNode) =>
  mount(<ThemeProvider theme={theme}>{content}</ThemeProvider>);
describe('parserNumber', () => {
  let featuresFlagsService: FeaturesFlagsService;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    featuresFlagsService = container.get(FeaturesFlagsService);
  });
  describe('CommonLink', () => {
    it('should not be hyperlinked while get number length less than 7', () => {
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_LESS_THAN_SEVEN} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(0);
    });
    it('should be hyperlinked while get number with string', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_IN_STRING} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(1);
    });
    it('should be hyperlinked while  while get valid special char', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={MESSAGE_WITH_SPECIAL_CHAR} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(1);
    });
    it('should be hyperlinked while get number with single blank', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_WITH_SINGLE_BLANK} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(1);
    });
    it('should be hyperlinked while get number with brackets', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_WITH_BRACKETS} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(1);
    });
    it('should return 1 hyperlinked while get a valid phone number and a string', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={MESSAGE_WITH_STRING_AND_NUMBER} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(1);
    });
    it('should not hyperlinked while get start with +number less than 10 ', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={MESSAGE_WITH_PLUS} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(0);
    });
    it('should not be hyperlinked while get too long number with dash and brackets', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_BRACKETS_WITH_LONG} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(0);
    });
    it('Phone number with valid format should be hyperlinked [JPT-1782]', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      featuresFlagsService.canUseTelephony = jest.fn().mockResolvedValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_WITH_DASH} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(1);
    });
    it('Phone number with invalid format should not be hyperlinked [JPT-1791]', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      featuresFlagsService.canUseTelephony = jest.fn().mockResolvedValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_MORE_THAN_FIFTEEN} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(0);
    });
    it('Call is placed via RingCentral directly when login app with RC users and web phone is enabled [JPT-1802]', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      featuresFlagsService.canUseTelephony = jest.fn().mockResolvedValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_WITH_BRACKETS} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(1);
    });
    it('Phone numbers should NOT be rendered as link and should NOT be clickable for non RC users [JPT-1812]', () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(false);
      featuresFlagsService.canUseTelephony = jest.fn().mockResolvedValue(true);
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_WITH_BRACKETS} />,
      );
      expect(linkWrapper.find('a')).toHaveLength(0);
    });
    it('should call direct call while click phone link', async () => {
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(true);
      const featuresFlagsService: FeaturesFlagsService = container.get(
        FeaturesFlagsService,
      );
      featuresFlagsService.canUseTelephony = jest.fn().mockResolvedValue(true);
      global['window'] = Object.create(window);
      Object.defineProperty(window, 'mozRTCPeerConnection', {
        value: true,
      });
      const telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      telephonyService.directCall = jest.fn();
      const linkWrapper = mountWithTheme(
        <CommonPhoneLink description={NUMBER_WITH_DASH} />,
      );
      setTimeout(() => {
        linkWrapper.find(JuiConversationNumberLink).simulate('click');
        expect(telephonyService.directCall).toHaveBeenCalledTimes(1);
      },         50);
    });
  });
});
