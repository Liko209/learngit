import React from 'react';
import styled from '../../foundation/styled-components';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import {
  spacing,
  ellipsis,
  grey,
  palette,
  lineClamp,
} from '../../foundation/utils';
import { JuiDivider, JuiDividerProps } from '../../components/Divider/Divider';

type JuiSettingSectionItemProps = {
  label: string;
  description?: string;
  disabled?: boolean;
};

const SettingSectionItemContentWrap = styled.div`
  && {
    width: 100%;
    display: flex;
    padding: ${spacing(4)};
    background-color: ${palette('common', 'white')};
  }
`;

const LeftWrap = styled.div`
  && {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    overflow: hidden;
    width: 100%;
    flex-shrink: 1;
    padding-right: ${spacing(2)};
  }
`;

const LabelWrap = styled<TypographyProps>(Typography)`
  && {
    color: ${grey('900')};
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    ${ellipsis()};

    &.disabled {
      opacity: ${({ theme }) => theme.opacity.p50};
    }
  }
`;

const DescriptionWrap = styled<TypographyProps>(Typography)`
  && {
    color: ${grey('600')};
    font-size: ${({ theme }) => theme.typography.caption1.fontSize};
    ${lineClamp(3, 15)}

    &.disabled {
      opacity: ${({ theme }) => theme.opacity.p50};
    }
  }
`;

const RightWrap = styled.div`
  && {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    width: 100%;
    flex-shrink: 2;
    padding-left: ${spacing(2)};
  }
`;

const DividerWrap = styled<JuiDividerProps>(JuiDivider)`
  && {
    margin: ${spacing(0, 4)};
    margin-top: -${spacing(0.25)};
  }
`;

const SettingSectionItemWrap = styled.div`
  &:last-child ${DividerWrap} {
    height: 0;
  }
`;

class JuiSettingSectionItem extends React.PureComponent<
  JuiSettingSectionItemProps
> {
  render() {
    const { children, label, description, disabled } = this.props;
    const disabledClass = disabled ? 'disabled' : '';
    return (
      <SettingSectionItemWrap className="setting-section-item">
        <SettingSectionItemContentWrap className="setting-section-item-content">
          <LeftWrap className="setting-section-item-left">
            <LabelWrap
              className={`setting-section-item-label ${disabledClass}`}
            >
              {label}
            </LabelWrap>
            {description && (
              <DescriptionWrap
                className={`setting-section-item-description ${disabledClass}`}
              >
                {description}
              </DescriptionWrap>
            )}
          </LeftWrap>
          <RightWrap className="setting-section-item-left">
            {children}
          </RightWrap>
        </SettingSectionItemContentWrap>
        <DividerWrap />
      </SettingSectionItemWrap>
    );
  }
}

export { JuiSettingSectionItem, JuiSettingSectionItemProps };
