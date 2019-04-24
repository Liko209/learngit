/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 14:23:02
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../store/utils';
import { NoteItemViewModel } from '../NoteItem.ViewModel';
import { GLOBAL_KEYS, ENTITY_NAME } from '../../../../../../store/constants';

jest.mock('../../../../store/utils');

const noteItemViewModel = new NoteItemViewModel({ id: 123 });

describe('NoteItemViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should get title ', () => {
    (getEntity as jest.Mock).mockReturnValue({
      title: 'This is note',
    });
    expect(noteItemViewModel.title).toBe('This is note');
  });

  it('should get subTitle', () => {
    (getEntity as jest.Mock).mockImplementation((type: string) => {
      if (type === ENTITY_NAME.PERSON) {
        return { userDisplayName: 'username' };
      }
      if (type === ENTITY_NAME.ITEM) {
        return { creatorId: 111 };
      }
      return null;
    });

    expect(noteItemViewModel.subTitle).toBe('username');
  });
});
