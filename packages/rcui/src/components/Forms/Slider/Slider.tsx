import React, { ComponentType } from 'react';
import MuiSlider, {
  SliderProps as MuiSliderProps,
} from '@material-ui/lab/Slider';
import Zoom from '@material-ui/core/Zoom';
import styled from '../../../foundation/styled-components';
import { palette, radius, spacing } from '../../../foundation/shared/theme';
import { noop } from '../../../foundation/shared/tools';
import { Palette } from '../../../foundation/styles';
import { RuiTooltip } from '../../../components/Tooltip';

type RuiSliderChildProps = {
  color: [keyof Palette, any];
  size: 's' | 'm' | 'l' | 'inherit' | 'xl';
  value: number;
  onChange: (event: React.ChangeEvent<HTMLElement>, value: number) => void;
};
type SliderChildComponent = ComponentType<RuiSliderChildProps>;

type RuiSliderProps = Pick<
  MuiSliderProps,
  | 'className'
  | 'disabled'
  | 'vertical'
  | 'max'
  | 'min'
  | 'step'
  | 'value'
  | 'valueReducer'
  | 'onChange'
  | 'onDragEnd'
  | 'onDragStart'
> & {
  Left?: SliderChildComponent;
  Right?: SliderChildComponent;
  tipRenderer?: ({ value }: { value: number }) => React.ReactNode;
};

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

const RuiSlider = styled(
  ({ className, Left, Right, ...rest }: RuiSliderProps) => {
    const hasWrapper = Left || Right;

    const renderSlider = () => (
      <MuiSlider
        className={!hasWrapper ? className : ''}
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

    const renderSliderWithWrapper = () => {
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
          {renderSlider()}
          {Right ? (
            <StyledChildWrapper>
              <Right {...childProps} />
            </StyledChildWrapper>
          ) : null}
        </StyledSliderWrapper>
      );
    };

    return hasWrapper ? renderSliderWithWrapper() : renderSlider();
  },
)``;

export { RuiSlider, RuiSliderProps, RuiSliderChildProps };
