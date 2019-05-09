/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:52:03
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { NoteView } from './Note.View';
import { NoteViewModel } from './Note.ViewModel';
import { NoteProps } from './types';

const Note = buildContainer<NoteProps>({
  View: NoteView,
  ViewModel: NoteViewModel,
});

export { Note };
