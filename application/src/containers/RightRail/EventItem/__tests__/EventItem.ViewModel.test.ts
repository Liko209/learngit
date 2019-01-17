/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-16 15:01:30
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { EventItemViewModel } from '../EventItem.ViewModel';
import { dateFormatter } from '../../../../utils/date';
import moment from 'moment';
import { ENTITY_NAME } from '../../../../store';

jest.mock('../../../../store/utils');

const mockEvent = {
  start: 1547629200000,
  text: 'Google',
};

const mappingEntity = {
  [ENTITY_NAME.EVENT_ITEM]: mockEvent,
};

const props = {
  id: 1,
};

let vm: EventItemViewModel;

describe('EventItemViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation(
      (name, id) => mappingEntity[name],
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new EventItemViewModel(props);
  });

  describe('text', () => {
    it('should be a event item title text when props incoming id', () => {
      expect(vm.text).toEqual(mockEvent.text);
    });
  });

  describe('createdTime', () => {
    it('should be a date string when incoming timestamp', () => {
      expect(vm.createdTime).toEqual(
        dateFormatter.dateAndTimeWithoutWeekday(moment(mockEvent.start)),
      );
    });
  });
});
