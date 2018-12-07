/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../store/utils';
import { ProfileDialogGroupViewModel } from '../ProfileDialogGroup.ViewModel';

jest.mock('../../../../../store/utils');

const mockData = {
  displayName: 'Group name',
};

const props = {
  id: 1,
  dismiss: jest.fn(),
};
const vm = new ProfileDialogGroupViewModel(props);

describe('ProfileDialogGroup.ViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be get conversation id when the component is instantiated', () => {
    expect(vm.id).toEqual(props.id);
  });

  it('should be get group entity when invoke class instance property group', () => {
    expect(vm.group).toEqual(mockData);
    mockData.displayName = 'Group name 2';
    expect(vm.group).toEqual(mockData);
  });

  it('should be called when invoke class instance method dismiss', () => {
    vm.dismiss();
    expect(props.dismiss).toBeCalled();
  });
});
