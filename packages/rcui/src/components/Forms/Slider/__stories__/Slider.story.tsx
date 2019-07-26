import React from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import styled from '../../../../foundation/styled-components';
import MuiTextField from '@material-ui/core/TextField';
import { alignCenterDecorator } from '../../../../storybook/decorators';
import { RuiIconography } from '../../../Iconography';
import { RuiSlider } from '../Slider';
import { Grid } from '@material-ui/core';

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
  .add('Base slider', function() {
    const { min, max } = getKnobs();

    function SliderDemo() {
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
    }

    return (
      <Wrapper>
        <SliderDemo />
      </Wrapper>
    );
  })
  .add('Continuous slider', function() {
    const { min, max } = getKnobs();

    function SliderDemo() {
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
    }

    return (
      <Wrapper>
        <SliderDemo />
      </Wrapper>
    );
  })
  .add('Discrete slider', function() {
    const { min, max } = getKnobs();

    function SliderDemo() {
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
    }

    return <SliderDemo />;
  })
  .add('With icon', function() {
    function SliderDemo() {
      const { value, handleChange } = useSliderState(10);
      return (
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <RuiIconography
              icon="star"
              iconColor={['primary', 'main']}
              iconSize="m"
            />
          </Grid>
          <Grid item xs>
            <RuiSlider
              value={value}
              onChange={handleChange}
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid item>
            <RuiIconography
              icon="star"
              iconColor={['primary', 'main']}
              iconSize="m"
            />
          </Grid>
        </Grid>
      );
    }

    return <SliderDemo />;
  })
  .add('With field', () => {
    function SliderDemo() {
      const { value, handleChange } = useSliderState(10);
      return (
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <RuiIconography
              icon="star"
              iconColor={['primary', 'main']}
              iconSize="m"
            />
          </Grid>
          <Grid item xs>
            <RuiSlider
              value={value}
              onChange={handleChange}
              aria-labelledby="input-slider"
            />
          </Grid>
          <Grid item>
            <MuiTextField
              value={value}
              style={{ width: '2em' }}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
      );
    }
    return <SliderDemo />;
  })
  .add('Volume slider', () => {
    const { min, max } = getKnobs();

    function SliderDemo() {
      const { value, handleChange } = useSliderState(10);
      return (
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <RuiIconography
              icon="speaker-mute"
              iconColor={['primary', 'main']}
              iconSize="m"
            />
          </Grid>
          <Grid item xs>
            <RuiSlider
              min={min}
              max={max}
              value={value}
              onChange={handleChange}
              aria-labelledby="input-slider"
              valueLabelFormat={x => `${x}%`}
            />
          </Grid>
          <Grid item>
            <RuiIconography
              icon="speaker"
              iconColor={['primary', 'main']}
              iconSize="m"
            />
          </Grid>
        </Grid>
      );
    }

    return <SliderDemo />;
  });
