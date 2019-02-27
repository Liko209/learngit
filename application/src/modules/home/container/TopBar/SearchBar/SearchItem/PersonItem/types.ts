/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:50:19
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';
import { Props, BaseViewProps, ISearchItemModel } from '../types';

type ViewProps = {
  person: PersonModel;
} & BaseViewProps;

export { Props, ViewProps, PersonModel, ISearchItemModel };
