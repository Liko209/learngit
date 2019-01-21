/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 13:41:49
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { NoteItemView } from './NoteItem.View';
import { NoteItemViewModel } from './NoteItem.ViewModel';

const NoteItem = buildContainer({
  View: NoteItemView,
  ViewModel: NoteItemViewModel,
});

export { NoteItem };
