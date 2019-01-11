/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 18:27:21
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { ActivityViewModel } from '../Activity.ViewModel';
import { TypeDictionary } from 'sdk/utils';

jest.mock('../../../../store/utils');

const mockPostEntityData: {
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
  itemTypeIds?: { [key: number]: number[] };
} = {};

describe('activityViewModel', () => {
  let activityViewModel: ActivityViewModel;
  beforeEach(() => {
    activityViewModel = new ActivityViewModel({ id: 1 });
    (getEntity as jest.Mock).mockReturnValue(mockPostEntityData);
    mockPostEntityData.itemTypeIds = {};
  });
  it('lifecycle method', () => {
    expect(activityViewModel._id).toBe(1);
  });

  it('_post', () => {
    expect(activityViewModel._post).toBe(mockPostEntityData);
  });

  it('_activityData', () => {
    const itemData = {
      version_map: {
        10: 2,
      },
    };
    mockPostEntityData.itemTypeIds = {
      [TypeDictionary.TYPE_ID_EVENT]: [TypeDictionary.TYPE_ID_EVENT],
      [TypeDictionary.TYPE_ID_TASK]: [TypeDictionary.TYPE_ID_TASK],
      [TypeDictionary.TYPE_ID_CODE]: [TypeDictionary.TYPE_ID_CODE],
      [TypeDictionary.TYPE_ID_LINK]: [TypeDictionary.TYPE_ID_LINK],
      [TypeDictionary.TYPE_ID_RC_VIDEO]: [TypeDictionary.TYPE_ID_RC_VIDEO],
      [TypeDictionary.TYPE_ID_CONFERENCE]: [TypeDictionary.TYPE_ID_CONFERENCE],
      [TypeDictionary.TYPE_ID_FILE]: [TypeDictionary.TYPE_ID_FILE],
      [TypeDictionary.TYPE_ID_PAGE]: [TypeDictionary.TYPE_ID_PAGE],
    };
    mockPostEntityData.itemData = itemData;
    expect(activityViewModel._activityData).toEqual({
      [TypeDictionary.TYPE_ID_EVENT]: {
        parameter: {
          verb: 'created',
          noun: 'event',
        },
        key: 'verb-article-noun',
      },
      [TypeDictionary.TYPE_ID_TASK]: {
        parameter: {
          verb: 'created',
          noun: 'task',
        },
        key: 'verb-article-noun',
      },
      [TypeDictionary.TYPE_ID_CODE]: {
        parameter: {
          verb: 'shared',
          noun: 'snippet',
        },
        key: 'verb-article-noun',
      },
      [TypeDictionary.TYPE_ID_LINK]: {
        parameter: {
          verb: 'shared',
          noun: 'link',
        },
        key: 'verb-article-noun',
      },
      [TypeDictionary.TYPE_ID_RC_VIDEO]: {
        parameter: {
          verb: 'started',
          noun: 'video chat',
        },
        key: 'verb-article-noun',
      },
      [TypeDictionary.TYPE_ID_CONFERENCE]: {
        parameter: {
          verb: 'started',
          noun: 'audio conference',
        },
        key: 'verb-article-noun',
      },
      [TypeDictionary.TYPE_ID_FILE]: {
        parameter: {
          count: 2,
          verb: 'uploaded',
          noun: 'version',
        },
        key: 'verb-noun-numerals',
      },
      [TypeDictionary.TYPE_ID_PAGE]: {
        parameter: {
          verb: 'shared',
          noun: 'note',
        },
        key: 'verb-article-noun',
      },
    });
  });

  it('activity', () => {
    const parentId = 2;
    mockPostEntityData.source = '';
    mockPostEntityData.parentId = parentId;
    expect(activityViewModel.activity).toEqual({
      key: 'replied',
    });

    mockPostEntityData.source = '';
    mockPostEntityData.parentId = 0;
    const itemData = {
      version_map: {
        10: 2,
      },
    };
    mockPostEntityData.itemTypeIds = {
      [TypeDictionary.TYPE_ID_FILE]: [TypeDictionary.TYPE_ID_FILE],
    };
    mockPostEntityData.itemData = itemData;
    expect(activityViewModel.activity).toEqual({
      parameter: {
        count: 2,
        verb: 'uploaded',
        noun: 'version',
      },
      key: 'verb-noun-numerals',
    });
    mockPostEntityData.itemTypeIds = {
      [TypeDictionary.TYPE_ID_PAGE]: [TypeDictionary.TYPE_ID_PAGE],
      [TypeDictionary.TYPE_ID_FILE]: [TypeDictionary.TYPE_ID_FILE],
    };
    expect(activityViewModel.activity).toEqual({
      parameter: {
        verb: 'shared',
        noun: 'items',
      },
      key: 'verb-noun',
    });
  });
});
