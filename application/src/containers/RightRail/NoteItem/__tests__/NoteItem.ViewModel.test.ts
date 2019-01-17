/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 14:23:02
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../store/utils';
import { NoteItemViewModel } from '../NoteItem.ViewModel';

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
    (getEntity as jest.Mock).mockReturnValue({
      userDisplayName: 'username',
    });

    expect(noteItemViewModel.subTitle).toBe('username');
  });
});
