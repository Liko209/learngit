/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-01 15:40:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from 'styled-components';
import { JuiBoxSelect } from '../../components/Selects/BoxSelect';
import { JuiMenuItem } from '../../components/Menus';
import { JuiListItemText } from '../../components/Lists';
import { spacing } from '../../foundation/utils';
import './styles.css';

type CallIdListElm = {
  phoneNumber: string;
  value: string;
  usageType: string;
  isTwoLine: boolean;
};

type CallerIdSelectorProps = {
  value: string;
  menu: CallIdListElm[];
  label: string;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

const StyledJuiBoxSelect = styled(JuiBoxSelect)`
  && {
    position: absolute;
    top: ${spacing(1.5)};
    left: 0;
    right: 0;
    margin: auto;
    display: flex;
    flex-direction: horizontal;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
    div:nth-of-type(1) {
      padding-bottom: 0;
    }
    div:nth-of-type(2) {
      background: transparent;
      border: none;
      width: auto;
      font-size: ${({ theme }) => theme.typography.caption2.fontSize};
      margin-right: ${spacing(-3)};

      & > div > div[role='button'] {
        padding: ${spacing(1.5, 4.5, 1.5, 1.5)};
        overflow: hidden;
        display: block;
        text-overflow: ellipsis;
        word-break: keep-all;
        white-space: nowrap;
        max-width: ${spacing(36)};
      }
    }
  }
`;

const CallerIdSelector = (props: CallerIdSelectorProps) => {
  const { menu, ...rest } = props;
  return (
    <StyledJuiBoxSelect
      {...rest}
      automationId="caller-id-selector"
      renderValue={(val) => val}
      MenuProps={{
        classes: { paper: 'caller_id-list-container' },
      }}
    >
      {menu.map((item: CallIdListElm) => (
        <JuiMenuItem value={item.phoneNumber} key={item.phoneNumber}>
          <JuiListItemText
            primary={item.usageType}
            key={item.phoneNumber}
            secondary={item.isTwoLine && item.value}
          />
        </JuiMenuItem>
      ))}
    </StyledJuiBoxSelect>
  );
};

export { CallerIdSelector };
