/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import * as utils from '@/store/utils';
import { LinkItemViewModel } from '../LinkItem.ViewModel';
import { LinkItemProps } from '../types';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { testable, test } from 'shield';
import { mockSingleEntity } from 'shield/application';

const itemService = {
  deleteItem: jest.fn(),
  doNotRenderItem: jest.fn(),
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);

jest.mock('@/store/utils');

const linkItemVM = new LinkItemViewModel({
  ids: [123, 456, 678],
} as LinkItemProps);
const mockItemValue = {
  deactivated: false,
  creatorId: 107913219,
  id: 24936465,
  image: null,
  summary: "React Components that Implement Google\\'s Material Design.",
  title: "The world\\'s most popular React UI framework - Material-UI",
  url: 'https://material-ui.com/',
};
describe('LinkItemViewModel', () => {
  function setUp(userId: number) {
    jest.spyOn(utils, 'getGlobalValue').mockReturnValue(userId);
  }
  beforeEach(() => {
    jest.resetAllMocks();
    (getEntity as jest.Mock).mockReturnValue({
      ...mockItemValue,
    });
  });
  it('should return postItems if item ids provide', () => {
    expect(linkItemVM.postItems).toMatchObject([
      {
        ...mockItemValue,
      },
      { ...mockItemValue },
      { ...mockItemValue },
    ]);
  });
  it('while delete item and item id not exist should not update item', () => {
    linkItemVM.onLinkItemClose(1);
    expect(linkItemVM.postItems).toHaveLength(3);
  });
  it('Should Only uploader can close the link/video card JPT-2592', () => {
    setUp(mockItemValue.creatorId);
    expect(linkItemVM.canClosePreview).toBeTruthy();
  });
  it('while non-uploader can not close the link/video card JPT-2592', () => {
    setUp(123321);
    expect(linkItemVM.canClosePreview).toBeFalsy();
  });
});

describe('LinkItemViewModel', () => {
  @testable
  class linkPreview {
    @test('should be false when profile link preview returns true [JPT-2817]')
    @mockSingleEntity(true)
    t1() {
      expect(linkItemVM.isLinkPreviewDisabled).toBeFalsy();
    }

    @test('should be true when profile link preview returns false [JPT-2817]')
    @mockSingleEntity(false)
    t2() {
      expect(linkItemVM.isLinkPreviewDisabled).toBeTruthy();
    }
    @test(
      'should be true when profile link preview returns undefined [JPT-2817]',
    )
    @mockSingleEntity(undefined)
    t3() {
      expect(linkItemVM.isLinkPreviewDisabled).toBeFalsy();
    }
  }
});
