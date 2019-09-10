/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { EventItemViewModel } from '../EventItem.ViewModel';
import { dateFormatter } from '../../../../../../utils/date';
import moment from 'moment';

jest.mock('@/store/utils');

const mockEvent = {
  start: 1547629200000,
  text: 'Google',
};

const vm = new EventItemViewModel();

describe('EventItemViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get text()', () => {
    it('should be a event item title text when props incoming id [JPT-845]', () => {
      (getEntity as jest.Mock).mockReturnValue(mockEvent);
      expect(vm.text).toEqual(mockEvent.text);
      (getEntity as jest.Mock).mockReturnValue({
        text: 'Facebook',
      });
      expect(vm.text).toEqual('Facebook');
    });
  });

  describe('get localTime()', () => {
    it('should be a time string when incoming timestamp [JPT-845]', () => {
      (getEntity as jest.Mock).mockReturnValue(mockEvent);
      expect(vm.localTime).toEqual(
        dateFormatter.localTime(moment(mockEvent.start)),
      );
      (getEntity as jest.Mock).mockReturnValue({
        start: 1547631484105,
      });
      expect(vm.localTime).toEqual(
        dateFormatter.localTime(moment(1547631484105)),
      );
    });
  });

  describe('get startTime()', () => {
    it('should be a date string when incoming timestamp [JPT-845]', () => {
      (getEntity as jest.Mock).mockReturnValue(mockEvent);
      expect(vm.startTime).toEqual(
        dateFormatter.dateAndTimeWithoutWeekday(moment(mockEvent.start)),
      );
      (getEntity as jest.Mock).mockReturnValue({
        start: 1547631484105,
      });
      expect(vm.startTime).toEqual(
        dateFormatter.dateAndTimeWithoutWeekday(moment(1547631484105)),
      );
    });
  });
});
