/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ChangeEvent } from 'react';
import {
  CountryRecord,
  StateRecord,
  DialingCountryInfo,
} from 'sdk/api/ringcentral/types';
import { E911SettingInfo } from 'sdk/module/rcInfo/setting/types';

type E911Props = {
  successCallback?: Function;
};

type E911ViewProps = E911Props & {
  handleFieldChange: (
    type: string,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  countryList: Country[];
  stateList: State[];
  countryOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => Promise<boolean>;
  stateOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  setCheckBox: (index: number) => () => void;
  value: E911SettingInfo;
  disabled: boolean;
  checkboxList: CheckBox[];
  fields: FieldsConfig;
  shouldShowSelectState: boolean;
  closeE911: (status: boolean) => void;
  loading: boolean;
  getCountryList: () => void;
};

type CheckBox = {
  i18text: string;
  checked: boolean;
  params?: Country;
};

type Country = CountryRecord | DialingCountryInfo;

type State = StateRecord;

type FieldsConfig = {
  customerName: string;
  street?: FieldItem;
  additionalAddress?: FieldItem;
  city?: FieldItem;
  state?: FieldItem;
  zipCode?: FieldItem;
};

type FieldItem = {
  label: string;
  ghostText: string;
  optional?: boolean;
};

export {
  E911Props,
  E911ViewProps,
  Country,
  State,
  FieldsConfig,
  FieldItem,
  CheckBox,
};
