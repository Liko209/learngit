/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-25 13:36:10
 * Copyright © RingCentral. All rights reserved.
 */
import { ITEM_SORT_KEYS } from 'sdk/module/item';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';
import { getSort } from '../utils';

const { EVENTS, TASKS, IMAGE_FILES, NOT_IMAGE_FILES } = RIGHT_RAIL_ITEM_TYPE;
const { START_TIME, CREATE_TIME, LATEST_POST_ID } = ITEM_SORT_KEYS;

describe('getSort()', () => {
  it('should order by START_TIME for events [JPT-981]', () => {
    expect(getSort(EVENTS).sortKey).toBe(START_TIME);
  });

  it('should order by CREATE_TIME for tasks [JPT-982]', () => {
    expect(getSort(TASKS).sortKey).toBe(CREATE_TIME);
  });

  it('should order by LATEST_POST_ID for images', () => {
    expect(getSort(IMAGE_FILES).sortKey).toBe(LATEST_POST_ID);
  });

  it('should order by LATEST_POST_ID for files', () => {
    expect(getSort(NOT_IMAGE_FILES).sortKey).toBe(LATEST_POST_ID);
  });
});
