/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-08 15:58:19
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { NoteProps, NoteViewProps } from './types';

class NoteViewModel extends AbstractViewModel<NoteProps> implements NoteViewProps {
  @computed
  get title() {
    return 'title';
  }

  @computed
  get summary() {
    return 'summary';
  }
}

export { NoteViewModel };
