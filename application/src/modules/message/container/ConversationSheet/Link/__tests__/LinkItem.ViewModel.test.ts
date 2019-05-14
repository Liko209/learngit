/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { LinkItemViewModel } from '../LinkItem.ViewModel';
import { LinkItemProps } from '../types';
import { ServiceLoader } from 'sdk/module/serviceLoader';

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
  id: 24936465,
  image: null,
  summary: "React Components that Implement Google\\'s Material Design.",
  title: "The world\\'s most popular React UI framework - Material-UI",
  url: 'https://material-ui.com/',
};
describe('LinkItemViewModel', () => {
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
});
