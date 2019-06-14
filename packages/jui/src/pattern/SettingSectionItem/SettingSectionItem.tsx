/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-02 15:14:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { RuiSlider } from 'rcui/components/Forms/Slider';
import styled from '../../foundation/styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import {
  spacing,
  ellipsis,
  grey,
  lineClamp,
  typography,
} from '../../foundation/utils';
import { JuiDivider, JuiDividerProps } from '../../components/Divider/Divider';

type JuiSettingSectionItemProps = {
  id: string | number;
  label?: string | JSX.Element;
  description?: string | JSX.Element;
  disabled?: boolean;
  automationId?: string;
};

const SettingSectionItemContentWrap = styled.div`
  && {
    width: 100%;
    display: flex;
    padding: ${spacing(0, 0, 4, 0)};
  }
`;

const LeftWrap = styled.div`
  && {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    flex: 2;
    padding-right: ${spacing(2.5)};
  }
`;

const LabelWrap = styled<TypographyProps>(Typography)`
  && {
    color: ${grey('900')};
    ${typography('body2')}
    ${ellipsis()};
    margin-bottom: ${spacing(1)};

    &.disabled {
      opacity: ${({ theme }) => theme.opacity['5']};
    }
  }
`;

const DescriptionWrap = styled<TypographyProps>(Typography)`
  && {
    color: ${grey('600')};
    ${typography('caption1')}
    ${lineClamp(3, 15)}

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
    overflow: hidden;
    width: 100%;
    flex: 1;
    padding-left: ${spacing(2.5)};
  }

  ${RuiSlider} {
    flex: 1;
    line-height: 0;
    padding: ${spacing(5, 0)};
  }
`;

const DividerWrap = styled<JuiDividerProps>(JuiDivider)``;

const SettingSectionItemWrap = styled.div`
  && {
    margin-bottom: ${spacing(4)};
  }
  &:last-child {
    margin-bottom: 0;
    ${SettingSectionItemContentWrap} {
      padding-bottom: 0;
    }
    ${DividerWrap} {
      height: 0;
      display: none;
    }
  }
`;

class JuiSettingSectionItem extends React.PureComponent<
  JuiSettingSectionItemProps
> {
  render() {
    const {
      children,
      id,
      label,
      description,
      disabled,
      automationId,
    } = this.props;
    const disabledClass = disabled ? 'disabled' : '';
    const testId = automationId ? automationId : id;
    return (
      <SettingSectionItemWrap
        className="setting-section-item"
        data-test-automation-id={`settingItem-${testId}`}
        data-disabled={disabled}
      >
        <SettingSectionItemContentWrap className="setting-section-item-content">
          <LeftWrap className="setting-section-item-left">
            <LabelWrap
              data-test-automation-id={`settingItemLabel-${testId}`}
              className={`setting-section-item-label ${disabledClass}`}
            >
              {label}
            </LabelWrap>
            {description && (
              <DescriptionWrap
                data-test-automation-id={`settingItemDescription-${testId}`}
                className={`setting-section-item-description ${disabledClass}`}
              >
                {description}
              </DescriptionWrap>
            )}
          </LeftWrap>
          <RightWrap className="setting-section-item-right">
            {children}
          </RightWrap>
        </SettingSectionItemContentWrap>
        <DividerWrap />
      </SettingSectionItemWrap>
    );
  }
}

export { JuiSettingSectionItem, JuiSettingSectionItemProps };
