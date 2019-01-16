/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 17:20:15
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { LinkItemViewModel } from '../LinkItem.ViewModel';
import { dateFormatter } from '../../../../utils/date';
import { ENTITY_NAME } from '../../../../store';

jest.mock('../../../../store/utils');

const mockLink = {
  createdAt: 1547086968632,
  creatorId: 123,
  title: 'Google',
};

const mockPerson = {
  userDisplayName: 'name',
};

const mappingEntity = {
  [ENTITY_NAME.LINK_ITEM]: mockLink,
  [ENTITY_NAME.PERSON]: mockPerson,
};

const props = {
  id: 1,
};

let vm: LinkItemViewModel;

describe('ImageItemViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation(
      (name, id) => mappingEntity[name],
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new LinkItemViewModel(props);
  });

  describe('link', () => {
    it('should be a link item entity when props incoming id', () => {
      expect(vm.link).toEqual(mockLink);
    });
  });

  describe('textSecondary', () => {
    it('should be a string when invoke person id', () => {
      expect(vm.textSecondary).toEqual(
        `${mockPerson.userDisplayName} · ${dateFormatter.date(
          mockLink.createdAt,
        )}`,
      );
    });

    it('should be a new person name string when change person name', () => {
      mockPerson.userDisplayName = 'new name';
      expect(vm.textSecondary).toEqual(
        `${mockPerson.userDisplayName} · ${dateFormatter.date(
          mockLink.createdAt,
        )}`,
      );
    });

    it('should be only a date string when display secondary text', () => {
      mockLink.creatorId = 0;
      mockLink.createdAt = 1547086968632;
      expect(vm.textSecondary).toEqual(dateFormatter.date(mockLink.createdAt));
    });

    it('should be only a person name string when display secondary text', () => {
      mockLink.creatorId = 123;
      mockLink.createdAt = 0;
      expect(vm.textSecondary).toEqual(mockPerson.userDisplayName);
    });
  });
});
