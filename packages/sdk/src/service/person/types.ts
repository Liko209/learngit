enum CALL_ID_USAGE_TYPE {
  MAIN_COMPANY_NUMBER = 'MainCompanyNumber',
  ADDITIONAL_COMPANY_NUMBER = 'AdditionalCompanyNumber',
  DIRECT_NUMBER = 'DirectNumber',
  COMPANY_FAX_NUMBER = 'CompanyFaxNumber',
  COMPANY_NUMBER = 'CompanyNumber',
  FORWARDED_NUMBER = 'ForwardedNumber',
  BLOCKED = 'Blocked',
}

enum PHONE_NUMBER_TYPE {
  DIRECT_NUMBER,
  COMPANY_MAIN_NUMBER,
  EXTENSION_NUMBER,
  PSEUDO_NUMBER,
}

type PhoneNumberInfo = {
  type: PHONE_NUMBER_TYPE;
  phoneNumber: string;
};

export { CALL_ID_USAGE_TYPE, PHONE_NUMBER_TYPE, PhoneNumberInfo };
