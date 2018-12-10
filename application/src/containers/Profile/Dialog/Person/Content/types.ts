/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import {
  ProfileDialogPersonProps,
  ProfileDialogPersonViewProps,
} from '../types';
import CompanyModel from '@/store/models/Company';
import { PhoneNumberInfo } from 'sdk/service/person';

type ProfileDialogPersonContentProps = ProfileDialogPersonProps;

type ProfileDialogPersonContentViewProps = ProfileDialogPersonViewProps & {
  company: CompanyModel;
  extensionNumbers: PhoneNumberInfo[];
  directNumbers: PhoneNumberInfo[];
};

enum ICON {
  COMPANY = 'work',
  LOCATION = 'places',
  DEPARTMENT = 'assignment',
  EXT = 'call',
  EMAIL = 'email',
  LINKED_IN = 'link',
  COPY = 'file_copy',
}

type FormGroupType = {
  icon?: ICON;
  label: string;
  value: string;
  valueEmphasize?: boolean;
  copy?: boolean;
};

export {
  ProfileDialogPersonContentProps,
  ProfileDialogPersonContentViewProps,
  FormGroupType,
  ICON,
};
