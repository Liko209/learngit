/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { ProfileDialogPersonContentViewProps } from './types';
import { ProfileDialogPersonViewModel } from '../ProfileDialogPerson.ViewModel';
import { getEntity } from '@/store/utils';
import CompanyModel from '@/store/models/Company';
import { Company } from 'sdk/models';
import { ENTITY_NAME } from '@/store';

class ProfileDialogPersonContentViewModel extends ProfileDialogPersonViewModel
  implements ProfileDialogPersonContentViewProps {
  @computed
  get company() {
    return getEntity<Company, CompanyModel>(
      ENTITY_NAME.COMPANY,
      this.person.companyId,
    );
  }
}

export { ProfileDialogPersonContentViewModel };
