/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-02-27 11:03:09
 * Copyright © RingCentral. All rights reserved.
 */

import { OpenProfileDialogViewModel } from '../OpenProfileDialog.ViewModel';

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
});
