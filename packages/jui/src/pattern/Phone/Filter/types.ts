/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-26 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ChangeEvent, ReactElement } from 'react';
import { JuiOutlineTextFieldProps } from '../../../components/Forms/OutlineTextField';

type FilterIconState = Pick<
  JuiOutlineTextFieldProps,
  'iconName' | 'iconPosition'
>;

interface IUseInput {
  (initValue: string, callback: IJuiChangePhoneFilter): [
    string,
    IJuiChangePhoneFilter
  ];
}

interface IChangePhoneFilter {
  (e: ChangeEvent<HTMLInputElement>): void;
}

interface IJuiChangePhoneFilter {
  (value: string): void;
}

type JuiPhoneFilterProps = {
  placeholder: string;
  clearButtonLabel: string;
  tooltip?: string;
  onChange: IJuiChangePhoneFilter;
  value?: string;
};

interface IJuiPhoneFilter {
  (props: JuiPhoneFilterProps): ReactElement;
}

export {
  IUseInput,
  IJuiPhoneFilter,
  JuiPhoneFilterProps,
  IChangePhoneFilter,
  IJuiChangePhoneFilter,
  FilterIconState,
};
