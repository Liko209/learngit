import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { RuiSlider } from '../Slider';
import styled from '@foundation/styled-components';
import { number } from '@storybook/addon-knobs';
import { alignCenterDecorator } from '../../../../storybook/decorators';
import { RuiIconography } from '../../../Iconography';
import MuiTextField from '@material-ui/core/TextField';

const Wrapper = styled.div`
  overflow: visible;
  padding: 10px 0;
  background-color: #fff;
`;

function getKnobs() {
  const min = number('min', 0);
  const max = number('max', 100);
  return { min, max };
}

function useSliderState(initialValue: number) {
  const [value, setValue] = React.useState(initialValue);
  const handleChange = (event: React.ChangeEvent, value: number) => {
    setValue(value);
  };
  return { value, handleChange };
}

storiesOf('Forms/Slider', module)
  .addDecorator(alignCenterDecorator)
  .add('Continuous slider', () => {
    const { min, max } = getKnobs();

    const SliderDemo = () => {
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

    return <SliderDemo />;
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
