/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 18:27:21
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { ActivityViewModel } from '../Activity.ViewModel';
import { ACTION } from '../types';
import { TypeDictionary } from 'sdk/utils';

jest.mock('../../../../store/utils');

let activityViewModel: ActivityViewModel;
const mockPostEntityData: {
  itemId?: number;
  itemIds?: number[];
  activityData?: {
    key: string;
    value: boolean | number[];
    old_value: boolean | number[];
  };
  itemData?: {
    version_map: {
      [key: number]: number;
    };
  };
  source?: string;
  parentId?: number;
} = {};

beforeAll(() => {
  (getEntity as jest.Mock).mockReturnValue(mockPostEntityData);

  activityViewModel = new ActivityViewModel({ id: 1 });
});

describe('activityViewModel', () => {
  it('lifecycle method', () => {
    expect(activityViewModel._id).toBe(1);
  });

  it('_post', () => {
    expect(activityViewModel._post).toBe(mockPostEntityData);
  });

  it('_itemIds', () => {
    expect(activityViewModel._itemIds).toBe(undefined);
    const itemIds = [1, 2, 3];
    mockPostEntityData.itemIds = itemIds;
    expect(activityViewModel._itemIds).toBe(itemIds);
    const itemId = 1;
    mockPostEntityData.itemId = itemId;
    expect(activityViewModel._itemIds).toEqual([itemId]);
  });

  it('_typeIds', () => {
    const itemIds = [
      TypeDictionary.TYPE_ID_PAGE,
      TypeDictionary.TYPE_ID_FILE,
      TypeDictionary.TYPE_ID_CONFERENCE,
      TypeDictionary.TYPE_ID_EVENT,
      TypeDictionary.TYPE_ID_TASK,
      TypeDictionary.TYPE_ID_CODE,
      TypeDictionary.TYPE_ID_LINK,
      TypeDictionary.TYPE_ID_RC_VIDEO,
    ];
    mockPostEntityData.itemId = undefined;
    mockPostEntityData.itemIds = itemIds;
    expect(activityViewModel._typeIds).toEqual({
      [TypeDictionary.TYPE_ID_EVENT]: [TypeDictionary.TYPE_ID_EVENT],
      [TypeDictionary.TYPE_ID_TASK]: [TypeDictionary.TYPE_ID_TASK],
      [TypeDictionary.TYPE_ID_CODE]: [TypeDictionary.TYPE_ID_CODE],
      [TypeDictionary.TYPE_ID_LINK]: [TypeDictionary.TYPE_ID_LINK],
      [TypeDictionary.TYPE_ID_RC_VIDEO]: [TypeDictionary.TYPE_ID_RC_VIDEO],
      [TypeDictionary.TYPE_ID_CONFERENCE]: [TypeDictionary.TYPE_ID_CONFERENCE],
      [TypeDictionary.TYPE_ID_FILE]: [TypeDictionary.TYPE_ID_FILE],
      [TypeDictionary.TYPE_ID_PAGE]: [TypeDictionary.TYPE_ID_PAGE],
    });
  });

  it('_activityData', () => {
    const itemData = {
      version_map: {
        10: 2,
      },
    };
    mockPostEntityData.itemData = itemData;
    expect(activityViewModel._activityData).toEqual({
      [TypeDictionary.TYPE_ID_EVENT]: { action: ACTION.CREATED },
      [TypeDictionary.TYPE_ID_TASK]: { action: ACTION.CREATED },
      [TypeDictionary.TYPE_ID_CODE]: { action: ACTION.SHARED },
      [TypeDictionary.TYPE_ID_LINK]: { action: ACTION.SHARED, quantifier: 1 },
      [TypeDictionary.TYPE_ID_RC_VIDEO]: { action: ACTION.STARTED },
      [TypeDictionary.TYPE_ID_CONFERENCE]: { action: ACTION.STARTED },
      [TypeDictionary.TYPE_ID_FILE]: { action: ACTION.UPLOADED, quantifier: 2 },
      [TypeDictionary.TYPE_ID_PAGE]: { action: ACTION.SHARED },
    });
  });

  it('activity', () => {
    const source = 'mobile';
    const parentId = 2;
    mockPostEntityData.source = source;
    expect(activityViewModel.activity).toEqual({
      action: ACTION.VIA,
      type: source,
    });
    mockPostEntityData.source = '';
    mockPostEntityData.parentId = parentId;
    expect(activityViewModel.activity).toEqual({
      action: ACTION.REPLIED,
    });

    mockPostEntityData.source = '';
    mockPostEntityData.parentId = 0;

    expect(activityViewModel.activity).toEqual({
      action: ACTION.SHARED,
      type: -1,
    });
  });
});
