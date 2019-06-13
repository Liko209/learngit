import React, { PureComponent } from 'react';
import MuiSlider from '@material-ui/lab/Slider';
import Zoom from '@material-ui/core/Zoom';
import styled from '../../../foundation/styled-components';
import { palette, radius, spacing } from '../../../foundation/shared/theme';
import { noop } from '../../../foundation/shared/tools';
import { Palette } from '../../../foundation/styles';
import { Omit } from '../../../foundation/utils/typeHelper';
import { RuiTooltip } from '../../../components/Tooltip';

type RuiSliderChildProps = {
  color: [keyof Palette, any];
  size: 's' | 'm' | 'l' | 'inherit' | 'xl';
  value: number;
  onChange: (event: React.ChangeEvent<HTMLElement>, value: number) => void;
};
type SliderChildComponent = React.ComponentType<RuiSliderChildProps>;

type RuiSliderProps = {
  disabled?: boolean;
  vertical?: boolean;
  max?: number;
  min?: number;
  step?: number;
  value?: number;
  thumb?: React.ReactElement<any>;
  onChange?: (event: React.ChangeEvent<{}>, value: number) => void;
  onDragEnd?: (event: React.ChangeEvent<{}>) => void;
  onDragStart?: (event: React.ChangeEvent<{}>) => void;
  Left?: SliderChildComponent;
  Right?: SliderChildComponent;
  tipRenderer?: ({ value }: { value: number }) => React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'onChange'>;

const Thumb = styled.div`
  width: 12px;
  height: 12px;
  background-color: ${palette('primary', 'main')};
  border-radius: ${radius('circle')};
`;

type TipThumbProps = Pick<RuiSliderProps, 'value' | 'tipRenderer'>;
const defaultTipRenderer = ({ value }: { value: number }) => value;
const TipThumb = ({
  tipRenderer = defaultTipRenderer,
  value = 0,
}: TipThumbProps) => {
  return (
    <>
      <RuiTooltip
        title={tipRenderer({ value })}
        placement="top"
        TransitionComponent={Zoom}
      >
        <Thumb />
      </RuiTooltip>
    </>
  );
};

const StyledChildWrapper = styled.div``;
const StyledSliderWrapper = styled.div`
  display: flex;
  align-items: center;

  ${StyledChildWrapper}:first-child {
    margin-right: ${spacing('s')};
  }

  ${StyledChildWrapper}:last-child {
    margin-left: ${spacing('s')};
  }

  ${StyledChildWrapper}:first-child, ${StyledChildWrapper}:last-child {
    > span {
      vertical-align: middle;
    }

    input {
      text-align: center;
    }
  }
`;

class RuiSliderNoStyled extends PureComponent<RuiSliderProps> {
  render() {
    return this._hasWrapper()
      ? this._renderSliderWithWrapper()
      : this._renderSlider();
  }

  private _hasWrapper() {
    const { Left, Right } = this.props;
    return Left || Right;
  }

  private _renderSlider() {
    const { className, Left, Right, ...rest } = this.props;

    return (
      <MuiSlider
        className={!this._hasWrapper() ? className : ''}
        {...rest}
        thumb={
          rest.step || rest.tipRenderer ? (
            <TipThumb value={rest.value} tipRenderer={rest.tipRenderer} />
          ) : (
            undefined
          )
        }
      />
    );
  }

  private _renderSliderWithWrapper() {
    const { className, Left, Right, ...rest } = this.props;

    const childProps: RuiSliderChildProps = {
      value: rest.value || 0,
      onChange: rest.onChange || noop,
      color: ['text', 'secondary'],
      size: 'm',
    };

    return (
      <StyledSliderWrapper className={className}>
        {Left ? (
          <StyledChildWrapper>
            <Left {...childProps} />
          </StyledChildWrapper>
        ) : null}
        {this._renderSlider()}
        {Right ? (
          <StyledChildWrapper>
            <Right {...childProps} />
          </StyledChildWrapper>
        ) : null}
      </StyledSliderWrapper>
    );
  }
}

const RuiSlider = styled(RuiSliderNoStyled)``;

export {
  RuiSlider,
  RuiSliderProps,
  RuiSliderChildProps,
  RuiSliderNoStyled,
  RuiSliderProps as RuiSliderNoStyledProps,
};
