/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 17:20:15
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { LinkItemViewModel } from '../LinkItem.ViewModel';
import { dateFormatter } from '../../../../../../utils/date';
import { ENTITY_NAME } from '../../../../../../store';

jest.mock('@/store/utils');

const mockLink = {
  createdAt: 1547086968632,
  creatorId: 123,
  title: 'Google',
  url: '',
};

const mockPerson = {
  userDisplayName: 'name',
};

const mappingEntity = {
  [ENTITY_NAME.ITEM]: mockLink,
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

  describe('personName', () => {
    it('should be a person name string when invoke person entity [JPT-868]', () => {
      expect(vm.personName).toEqual(mockPerson.userDisplayName);
    });

    it('should be a new person name string when change person name [JPT-868]', () => {
      mockPerson.userDisplayName = 'new name';
      expect(vm.personName).toEqual(mockPerson.userDisplayName);
    });
  });

  describe('createdTime', () => {
    it('should be a date string when incoming timestamp [JPT-868]', () => {
      expect(vm.createdTime).toEqual(dateFormatter.date(mockLink.createdAt));
    });
  });

  describe('url', () => {
    it('should be a url string when has http protocol and has the www [JPT-868]', () => {
      mockLink.url = 'http://www.google.com';
      expect(vm.url).toEqual(mockLink.url);
    });

    it('should be a url string when has http protocol and without the www [JPT-868]', () => {
      mockLink.url = 'http://google.com';
      expect(vm.url).toEqual(mockLink.url);
    });

    it('should be a url string when without http protocol and without the www [JPT-868]', () => {
      mockLink.url = 'google.com';
      expect(vm.url).toEqual(`http://${mockLink.url}`);
    });

    it('should be a url string when without http protocol and has the www [JPT-868]', () => {
      mockLink.url = 'www.google.com';
      expect(vm.url).toEqual(`http://${mockLink.url}`);
    });
  });
});
