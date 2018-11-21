/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  PersonProfileMiniCardProps,
  PersonProfileMiniCardViewProps,
} from './types';

class PersonProfileMiniCardViewModel
  extends AbstractViewModel<PersonProfileMiniCardProps>
  implements PersonProfileMiniCardViewProps {
  @computed
  get id() {
    // person id
    return this.props.id;
  }
}

export { PersonProfileMiniCardViewModel };
