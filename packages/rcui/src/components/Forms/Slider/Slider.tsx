import Slider, { SliderProps } from '@material-ui/core/Slider';
import styled from '../../../foundation/styled-components';

const RuiSlider = styled(Slider)``;
type RuiSliderProps = SliderProps;
RuiSlider.defaultProps = {
  valueLabelDisplay: 'auto',
};
RuiSlider.displayName = 'RuiSlider';
export { RuiSlider, RuiSliderProps };
