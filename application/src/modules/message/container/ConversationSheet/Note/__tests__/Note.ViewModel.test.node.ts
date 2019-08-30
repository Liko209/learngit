/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 19:28:24
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { NoteViewModel } from '../Note.ViewModel';

jest.mock('@/store/utils');

const mockData = {
  title: 'title',
  summary: 'summary',
};

const props = {
  ids: [123],
};
const noteViewModel = new NoteViewModel(props);

describe('Note item', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockData);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computed _items', () => {
    expect(noteViewModel._items).toEqual([mockData]);
  });

  it('computed title', () => {
    expect(noteViewModel.title).toBe(mockData.title);
  });

  it('computed summary', () => {
    expect(noteViewModel.summary).toBe(mockData.summary);
  });
});
