/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ChangeEvent } from 'react';
import { DialingCountryInfo, StateRecord } from 'sdk/api/ringcentral/types';
import { E911SettingInfo } from 'sdk/module/rcInfo/setting/types';

type E911Props = {};

type E911ViewProps = E911Props & {
  handleFieldChange: (
    type: string,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  countryList: Country[];
  stateList: State[];
  countryOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => Promise<void>;
  stateOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: E911SettingInfo;
  disabled: boolean;
  checkboxList: CheckBox[];
};

type CheckBox = {
  i18text: string;
  checked: boolean;
  params?: object;
};

type Country = DialingCountryInfo;

type State = StateRecord;

export { E911Props, E911ViewProps, Country, State, CheckBox };
