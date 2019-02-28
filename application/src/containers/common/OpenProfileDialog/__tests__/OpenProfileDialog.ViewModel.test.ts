/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-27 11:03:09
 * Copyright © RingCentral. All rights reserved.
 */

import { OpenProfileDialogViewModel } from '../OpenProfileDialog.ViewModel';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';

jest.mock('sdk/utils');

const props = {
  id: 1,
};

let vm: OpenProfileDialogViewModel;

describe('OpenProfileDialogViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vm = new OpenProfileDialogViewModel(props);
  });

  describe('id', () => {
    it('should be get conversation id or person id when the component is instantiated', () => {
      expect(vm.id).toEqual(props.id);
    });
  });

  describe('typeId', () => {
    it('should be a TYPE_ID_GROUP type when the id is group type id', () => {
      (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValueOnce(
        TypeDictionary.TYPE_ID_GROUP,
      );

      expect(vm.typeId).toEqual(TypeDictionary.TYPE_ID_GROUP);
    });

    it('should be a TYPE_ID_TEAM type when the id is team type id', async () => {
      (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValueOnce(
        TypeDictionary.TYPE_ID_TEAM,
      );
      expect(vm.typeId).toEqual(TypeDictionary.TYPE_ID_TEAM);
    });

    it('should be a TYPE_ID_PERSON type when the id is person type id', async () => {
      (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValueOnce(
        TypeDictionary.TYPE_ID_PERSON,
      );
      expect(vm.typeId).toEqual(TypeDictionary.TYPE_ID_PERSON);
    });
  });
});
