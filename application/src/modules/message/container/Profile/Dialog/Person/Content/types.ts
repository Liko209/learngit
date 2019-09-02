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
import { PhoneNumberInfo } from 'sdk/module/person/entity';

type ProfileDialogPersonContentProps = ProfileDialogPersonProps;

type ProfileDialogPersonContentViewProps = ProfileDialogPersonViewProps & {
  company: CompanyModel;
  extensionNumbers: PhoneNumberInfo[];
  directNumbers: PhoneNumberInfo[];
  isMe: boolean;
  colonsEmoji: string;
  statusPlainText: string;
  url: string;
};

type FormGroupType = {
  icon?: string;
  label: string;
  value: any;
  valueEmphasize?: boolean;
  copyAria?: string;
  copyValue?: string;
  showCall?: boolean;
};

export {
  ProfileDialogPersonContentProps,
  ProfileDialogPersonContentViewProps,
  FormGroupType,
};
