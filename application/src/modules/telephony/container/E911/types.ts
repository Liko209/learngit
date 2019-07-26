/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ChangeEvent } from 'react';
import { DialingCountryInfo, StateRecord } from 'sdk/api/ringcentral/types';

type E911Props = {};

type E911ViewProps = E911Props & {
  handleFieldChange: (
    type: string,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  getCountryInfo: () => void;
  countryList: Country[];
  stateList: State[];
  country: string;
  state: string;
  countryOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: () => void;
  stateOnChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

type Country = DialingCountryInfo;

type State = StateRecord;

export { E911Props, E911ViewProps, Country, State };
