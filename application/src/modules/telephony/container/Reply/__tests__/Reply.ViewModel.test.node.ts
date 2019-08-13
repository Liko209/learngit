/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-05-07 13:45:52
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../../interface/constant';

import { ReplyViewModel } from '../Reply.ViewModel';
import {
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';
import { filterCharacters, wordsLimitation } from '../config';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let replyViewModel: ReplyViewModel;

beforeAll(() => {
  replyViewModel = new ReplyViewModel();
});

describe('ReplyViewModel', () => {
  describe('replyWithPattern()', () => {
    it('should call replyWithPattern in TelephonyService', async () => {
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      replyViewModel.replyWithPattern(
        RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
        5,
        RTC_REPLY_MSG_TIME_UNIT.MINUTE,
      );
      expect(_telephonyService.replyWithPattern).toHaveBeenCalledWith(
        RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
        5,
        RTC_REPLY_MSG_TIME_UNIT.MINUTE,
      );
    });
  });

  describe('startReply()', () => {
    it('should call startReply in TelephonyService', async () => {
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      replyViewModel.startReply();
      expect(_telephonyService.startReply).toHaveBeenCalled();
    });
  });

  describe('filter special characters [JPT-1723]', () => {
    it('should have the filter list', () => {
      expect(filterCharacters).toEqual('~@#$%^&*()_+{}[]|<>/');
    });
  });
  describe('textarea 200 words limitation [JPT-1722]', () => {
    it('should have 200 words limitation', () => {
      expect(wordsLimitation).toEqual(100);
    });
  });
  describe('should not send empty message and remove heading space', () => {
    it('should remove heading space [JPT-1721]', () => {
      const ts = new TelephonyStore();
      ts.inputCustomReplyMessage('    test message');
      expect(ts.customReplyMessage).toEqual('test message');
    });
    it('should remove empty message/line [JPT-1734]', () => {
      const ts = new TelephonyStore();
      ts.inputCustomReplyMessage('    \r \n ');
      expect(ts.customReplyMessage).toEqual('');
    });
  });

  describe('replyWithMessage', () => {
    it('should call `replyWithMessage` on service', () => {
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      replyViewModel.replyWithMessage();
      expect(_telephonyService.replyWithMessage).toHaveBeenCalled();
    });
  });
});
