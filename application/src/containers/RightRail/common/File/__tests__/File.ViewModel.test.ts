/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:29:06
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../store/utils';
import { FileViewModel } from '../File.ViewModel';
import { dateFormatter } from '../../../../../utils/date';
import { ENTITY_NAME } from '../../../../../store';

jest.mock('../../../../../store/utils');

const mockFile = {
  createdAt: 1547086968632,
  creatorId: 123,
  name: '',
  versions: [
    {
      date: 1554796233126,
    },
  ],
};

const mockPerson = {
  userDisplayName: 'name',
};

const mappingEntity = {
  [ENTITY_NAME.ITEM]: mockFile,
  [ENTITY_NAME.PERSON]: mockPerson,
};

const props = {
  id: 1,
};

let vm: FileViewModel;

describe('FileViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation(
      (name, id) => mappingEntity[name],
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new FileViewModel(props);
  });

  describe('file', () => {
    it('should be a file item entity when props incoming id', () => {
      expect(vm.file).toEqual(mockFile);
    });

    it('should be a new file item entity when change file name', () => {
      mockFile.name = 'new file name';
      expect(vm.file).toEqual(mockFile);
    });
  });

  describe('personName', () => {
    it('should be a person name string when invoke person entity [JPT-965]', () => {
      expect(vm.personName).toEqual(mockPerson.userDisplayName);
    });

    it('should be a new person name string when change person name [JPT-965]', () => {
      mockPerson.userDisplayName = 'new person name';
      expect(vm.personName).toEqual(mockPerson.userDisplayName);
    });
  });

  describe('modifiedTime', () => {
    it('should be a date string of update time when incoming timestamp [JPT-965]', () => {
      expect(vm.modifiedTime).toEqual(
        dateFormatter.date(mockFile.versions[0].date),
      );
    });

    it('should be a date string of create time when versions is undefined', () => {
      mockFile.versions = [];
      expect(vm.modifiedTime).toEqual(dateFormatter.date(mockFile.createdAt));
    });
  });
});
