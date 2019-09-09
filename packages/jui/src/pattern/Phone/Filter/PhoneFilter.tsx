/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-26 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo, useState, useRef } from 'react';
import styled from '../../../foundation/styled-components';
import {
  StyledIconRight,
  JuiOutlineTextField,
} from '../../../components/Forms/OutlineTextField';
import { spacing, grey, typography, width } from '../../../foundation/utils';
import {
  IUseInput,
  IJuiPhoneFilter,
  JuiPhoneFilterProps,
  IJuiChangePhoneFilter,
  IChangePhoneFilter,
  FilterIconState,
} from './types';

const StyledPhoneFilter = styled(JuiOutlineTextField)`
  width: ${width(50)};
  padding: ${spacing(0, 3)};
  border-color: ${grey('300')};

  input {
    ${typography('body1')};
  }

  ${StyledIconRight} {
    margin-left: ${spacing(2)};

    :active {
      outline: none;
    }
  }
`;

const MAXLENGTH = 60;

const useInput: IUseInput = (initValue, callback) => {
  const [value, setValue] = useState(initValue);

  const setInputValue = (value: string) => {
    setValue(value);

    callback(value);
  };

  return [value, setInputValue];
};
/* eslint-disable react/prop-types */
const PhoneFilter: IJuiPhoneFilter = ({
  clearButtonLabel,
  placeholder,
  onChange,
  tooltip,
  value = '',
}) => {
  const ref: any = useRef(null);

  const [inputValue, setValue] = useInput(value, onChange);

  const onFilterChange: IChangePhoneFilter = e => setValue(e.target.value);

  const onFilterClear = () => {
    setValue('');

    ref.current.focus();
  };

  const iconState: FilterIconState = inputValue
    ? {
        iconName: ['filter', 'close'],
        iconPosition: 'both',
      }
    : {
        iconName: 'filter',
        iconPosition: 'left',
      };

  const iconRightProps = {
    tabIndex: 0,
    'aria-label': clearButtonLabel,
    'data-test-automation-id': 'close',
  };

  const inputProps = {
    placeholder,
    inputProps: {
      maxLength: MAXLENGTH,
    },
  };

  return (
    <StyledPhoneFilter
      size="small"
      radiusType="rounded"
      ref={ref}
      value={inputValue}
      InputProps={inputProps}
      IconRightProps={iconRightProps}
      IconRightToolTip={tooltip}
      onChange={onFilterChange}
      onClickIconRight={onFilterClear}
      data-test-automation-id="phoneFilter"
      {...iconState}
    />
  );
};

const JuiPhoneFilter = memo(PhoneFilter);

export { JuiPhoneFilter, JuiPhoneFilterProps, IJuiChangePhoneFilter };
