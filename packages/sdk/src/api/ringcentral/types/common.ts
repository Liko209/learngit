/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 13:54:41
 * Copyright © RingCentral. All rights reserved.
 */

type RcCountryInfo = {
  uri?: string;
  id?: string;
  name?: string;
  isoCode?: string;
  callingCode?: string;
  emergencyCalling?: boolean;
};

type RcTimezoneInfo = {
  uri?: string;
  id?: string;
  name?: string;
  description?: string;
};

type RcLanguageInfo = {
  uri?: string;
  id?: string;
  greeting?: boolean;
  formattingLocale?: boolean;
  localeCode?: string;
  name?: string;
  ui?: string;
};

type RcGreetingLanguageInfo = {
  id?: string;
  localeCode?: string;
  name?: string;
};

type RcFormattingLocalInfo = {
  id?: string;
  localeCode?: string;
  name?: string;
};

type RcRegionalSetting = {
  homeCountry?: RcCountryInfo;
  timezone?: RcTimezoneInfo;
  language?: RcLanguageInfo;
  greetingLanguage?: RcGreetingLanguageInfo;
  formattingLocale?: RcFormattingLocalInfo;
  timeFormat?: string;
};

type RcStatusInfo = {
  comment?: string;
  reason?: string;
};

export { RcCountryInfo, RcRegionalSetting, RcStatusInfo };
