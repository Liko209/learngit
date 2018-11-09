/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-09 13:12:42
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/models';
import ItemModel from '../Item';

describe('File items tests', () => {
  it('getFileIcon()', () => {
    const itemModel = ItemModel.fromJS({} as Item);
    const type = itemModel.getFileIcon('xlsx');
    expect(type).toBe('sheet');
    const type1 = itemModel.getFileIcon('xxx');
    expect(type1).toBeNull();
  });

});
