/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../store/utils';
import { AddedViewModel } from '../Added.ViewModel';

jest.mock('../../../../../../store/utils');

const mockData = {
  activityData: {},
  createdAt: 123123,
};

const props = {
  id: 123,
};
const addedViewModel = new AddedViewModel(props);

describe('Team added', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed _id', () => {
    expect(addedViewModel._id).toEqual(props.id);
  });

  it('computed _post', () => {
    expect(addedViewModel._post).toEqual(mockData);
  });

  // it('computed title', () => {
  //   expect(addedViewModel.title).toBe(mockData.title);
  // });

  // it('computed summary', () => {
  //   expect(addedViewModel.summary).toBe(mockData.summary);
  // });
});
