/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { OpenProfileDialogProps, OpenProfileDialogViewProps } from './types';
import { GlipTypeUtil } from 'sdk/utils';

class OpenProfileDialogViewModel
  extends AbstractViewModel<OpenProfileDialogProps>
  implements OpenProfileDialogViewProps {
  @computed
  get id() {
    return this.props.id; // personId || conversationId
  }

  @computed
  get typeId(): number {
    return GlipTypeUtil.extractTypeId(this.id);
  }
}

export { OpenProfileDialogViewModel };
