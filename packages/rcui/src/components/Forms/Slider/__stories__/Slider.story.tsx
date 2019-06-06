import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import styled from '../../../../foundation/styled-components';
import MuiTextField from '@material-ui/core/TextField';
import { alignCenterDecorator } from '../../../../storybook/decorators';
import { RuiIconography } from '../../../Iconography';
import { RuiSliderNoStyled, RuiSliderProps } from '../Slider';
const RuiSlider = RuiSliderNoStyled;
(RuiSlider as any).displayName = 'RuiSlider';
const Wrapper = styled.div`
  overflow: visible;
  padding: 10px 0;
  background-color: #fff;
`;

function getKnobs() {
  return {
    get min() {
      return number('min', 0);
    },
    get max() {
      return number('max', 100);
    },
    get value() {
      return number('value', 10);
    },
  };
}

function useSliderState(initialValue: number) {
  const [value, setValue] = React.useState(initialValue);
  const handleChange = (event: React.ChangeEvent<{}>, value: number) => {
    setValue(value);
  };
  return { value, handleChange };
}

storiesOf('Forms/Slider', module)
  .addDecorator(alignCenterDecorator)
  .addParameters({
    info: {
      components: { RuiSlider },
    },
  })
  .add('Base slider', () => {
    const { min, max, value } = getKnobs();

    return (
      <Wrapper>
        <RuiSlider min={min} max={max} value={value} onChange={() => {}} />
      </Wrapper>
    );
  })
  .add('Continuous slider', () => {
    const { min, max } = getKnobs();

    const SliderDemo: React.ComponentType<RuiSliderProps> = () => {
      const { value, handleChange } = useSliderState(10);
      return (
        <Wrapper>
          <RuiSlider
            min={min}
            max={max}
            value={value}
            onChange={handleChange}
          />
        </Wrapper>
      );
    };

    return (
      <Wrapper>
        <SliderDemo />
      </Wrapper>
    );
  })
  .add('Discrete slider', () => {
    const { min, max } = getKnobs();

    const SliderDemo = () => {
      const { value, handleChange } = useSliderState(10);
      return (
        <Wrapper>
          <RuiSlider
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={handleChange}
          />
        </Wrapper>
      );
    };

    return <SliderDemo />;
  })
  .add('With icon', () => {
    const { min, max } = getKnobs();

    const SliderDemo = () => {
      const { value, handleChange } = useSliderState(10);
      return (
        <RuiSlider
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          Left={props => (
            <RuiIconography
              icon="star"
              iconColor={props.color}
              iconSize={props.size}
            />
          )}
          Right={props => (
            <RuiIconography
              icon="star"
              iconColor={props.color}
              iconSize={props.size}
            />
          )}
        />
      );
    };

    return <SliderDemo />;
  })
  .add('With field', () => {
    const { min, max } = getKnobs();

    const SliderDemo = () => {
      const { value, handleChange } = useSliderState(10);
      return (
        <RuiSlider
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          Left={props => (
            <RuiIconography
              icon="star"
              iconColor={props.color}
              iconSize={props.size}
            />
          )}
          Right={props => (
            <MuiTextField
              style={{ width: '2em' }}
              value={Math.ceil(props.value)}
              InputProps={{
                readOnly: true,
              }}
            />
          )}
        />
      );
    };
    return <SliderDemo />;
  })
  .add('Volume slider', () => {
    const { min, max } = getKnobs();

    const SliderDemo = () => {
      const { value, handleChange } = useSliderState(10);
      return (
        <RuiSlider
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          tipRenderer={({ value }) => `${Math.ceil(value)}%`}
          Left={props => (
            <RuiIconography
              icon="speaker-mute"
              iconColor={props.color}
              iconSize={props.size}
            />
          )}
          Right={props => (
            <RuiIconography
              icon="speaker"
              iconColor={props.color}
              iconSize={props.size}
            />
          )}
        />
      );
    };

    return <SliderDemo />;
  });
