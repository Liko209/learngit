/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:29:06
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '../../../../store/models/FileItem';
import { getEntity } from '../../../../store/utils';
import { getFileType } from '../../../../common/getFileType';
import { ImageItemViewModel } from '../ImageItem.ViewModel';
import { dateFormatter } from '../../../../utils/date';
import { ENTITY_NAME } from '../../../../store';

jest.mock('../../../../store/utils');
jest.mock('../../../../common/getFileType');

const mockFile = {
  createdAt: 1547086968632,
  creatorId: 123,
  name: '',
};

const mockPerson = {
  userDisplayName: 'name',
};

const mappingEntity = {
  [ENTITY_NAME.FILE_ITEM]: mockFile,
  [ENTITY_NAME.PERSON]: mockPerson,
};

const props = {
  id: 1,
};

let vm: ImageItemViewModel;

describe('ImageItemViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation(
      (name, id) => mappingEntity[name],
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ImageItemViewModel(props);
  });

  describe('file', () => {
    it('should be a file item entity when props incoming id', () => {
      expect(vm.file).toEqual(mockFile);
    });
  });

  describe('secondary', () => {
    it('should be a string when invoke person id', () => {
      expect(vm.secondary).toEqual(
        `${mockPerson.userDisplayName} · ${dateFormatter.date(
          mockFile.createdAt,
        )}`,
      );
    });

    it('should be a new person name string when change person name', () => {
      mockPerson.userDisplayName = 'new name';
      expect(vm.secondary).toEqual(
        `${mockPerson.userDisplayName} · ${dateFormatter.date(
          mockFile.createdAt,
        )}`,
      );
    });

    it('should be a date string when display secondary text', () => {
      mockFile.creatorId = 0;
      mockFile.createdAt = 1547086968632;
      expect(vm.secondary).toEqual(dateFormatter.date(mockFile.createdAt));
    });

    it('should be a person name string when display secondary text', () => {
      mockFile.creatorId = 123;
      mockFile.createdAt = 0;
      expect(vm.secondary).toEqual(mockPerson.userDisplayName);
    });
  });

  describe('url', () => {
    const previewUrl = 'IMAGE_URL';

    it('should be a string when item is image type', () => {
      (getFileType as jest.Mock).mockReturnValue({
        previewUrl,
        type: FileType.image,
      });
      expect(vm.url).toEqual(previewUrl);
    });
  });
});
