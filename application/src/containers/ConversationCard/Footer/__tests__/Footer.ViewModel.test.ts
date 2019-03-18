/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { FooterViewModel } from '../Footer.ViewModel';

jest.mock('../../../../store/utils');

let footerViewModel: FooterViewModel;
const mockPostEntityData: {
  likes?: number[];
} = {};

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue(mockPostEntityData);

  footerViewModel = new FooterViewModel({ id: 1 });
});

describe('footerViewModel', () => {
  it('lifecycle method', () => {
    expect(footerViewModel.postId).toBe(1);
  });

  it('_post', () => {
    expect(footerViewModel._post).toBe(mockPostEntityData);
  });

  it('likeCount', () => {
    mockPostEntityData.likes! = [];
    expect(footerViewModel.likeCount).toBe(0);
    mockPostEntityData.likes! = [1, 2, 3, 4];
    expect(footerViewModel.likeCount).toBe(4);
  });
});
