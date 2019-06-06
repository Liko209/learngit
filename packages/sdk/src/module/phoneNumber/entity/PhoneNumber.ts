/*
 * @Author: Lewi.Li
 * @Date: 2019-05-07 14:15:43
 * Copyright © RingCentral. All rights reserved.
 */
import { IdModel } from '../../../framework/model';

enum PhoneNumberType {
  DirectNumber = 'DirectNumber',
  MainCompanyNumber = 'MainCompanyNumber',
  Blocked = 'Blocked',
  NickName = 'NickName',
  CompanyNumber = 'CompanyNumber',
  AdditionalCompanyNumber = 'AdditionalCompanyNumber',
  CompanyFaxNumber = 'CompanyFaxNumber',
  ForwardedNumber = 'ForwardedNumber',
  ForwardedCompanyNumber = 'ForwardedCompanyNumber',
  ContactCenterNumber = 'ContactCenterNumber',
  ConferencingNumber = 'ConferencingNumber',
  Extension = 'Extension',
  PhoneNumberAnonymous = 'anonymous',
  Unknown = 'Unknown',
}

type PhoneNumber = IdModel<string> & {
  phoneNumberType: PhoneNumberType;
};

export { PhoneNumber, PhoneNumberType };
