/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-08-20 10:18:19
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import { spacing, ellipsis, grey, typography } from '../../foundation/utils';
import { JuiDivider, JuiDividerProps } from '../../components/Divider/Divider';
import { JuiSelect } from '../Select';
import { RuiCheckbox } from 'rcui/components/Checkbox';

type JuiSettingItemProps = {
  id: string | number;
  indent?: boolean;
  divider?: boolean;
  label?: string | JSX.Element;
  disabled?: boolean;
  automationId?: string;
};

const SettingItemContentWrap = styled.div`
  && {
    width: 100%;
    display: flex;
  }
`;

const LeftWrap = styled.div`
  && {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    min-width: 0;
  }
  &.indent {
    padding-left: ${spacing(7.5)};
    @media (max-width: 480px) {
      padding-left: ${spacing(2)};
    }
  }
`;

const LabelWrap = styled.span`
  && {
    ${typography('body1')}
    color: ${grey('900')};
    ${ellipsis()};
    &.disabled {
      opacity: ${({ theme }) => theme.opacity['5']};
    }
  }
`;

const RightWrap = styled.div`
  && {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    margin-left: ${spacing(4)};
    ${JuiSelect} {
      margin: ${spacing(2, 0)};
      max-width: 200px;
      @media (max-width: 480px) {
        max-width: 168px;
      }
    }
    ${RuiCheckbox} {
      margin: ${spacing(-1, 0)};
      margin-right: -9px;
    }
  }
`;

const DividerWrap = styled<JuiDividerProps>(JuiDivider)`
  && {
    margin: ${spacing(2, 0)};
  }
`;

const SettingItemWrap = styled.div`
  &:last-child {
    margin-bottom: ${spacing(-0.5)};
  }
`;

class JuiSettingItem extends React.PureComponent<JuiSettingItemProps> {
  render() {
    const {
      children,
      id,
      label,
      disabled,
      automationId,
      divider,
      indent,
    } = this.props;
    const disabledClass = disabled ? 'disabled' : '';
    const indentClass = indent ? 'indent' : '';
    const testId = automationId ? automationId : id;
    return (
      <SettingItemWrap
        className="setting-item"
        data-test-automation-id={`settingItem-${testId}`}
        data-disabled={disabled}
      >
        <SettingItemContentWrap className="setting-item-content">
          <LeftWrap className={`setting-item-left ${indentClass}`}>
            <LabelWrap
              id={`${id}`}
              data-test-automation-id={`settingItemLabel-${testId}`}
              className={`setting-item-label ${disabledClass}`}
            >
              {label}
            </LabelWrap>
          </LeftWrap>
          <RightWrap className="setting-item-right">{children}</RightWrap>
        </SettingItemContentWrap>
        {divider && <DividerWrap />}
      </SettingItemWrap>
    );
  }
}

export { JuiSettingItem, JuiSettingItemProps };
