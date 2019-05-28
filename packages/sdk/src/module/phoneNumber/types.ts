/*
 * @Author: Lewi.Li
 * @Date: 2019-05-11 10:43:30
 * Copyright © RingCentral. All rights reserved.
 */

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
}

const PhoneNumberAnonymous = 'anonymous';

export { PhoneNumberType, PhoneNumberAnonymous };
