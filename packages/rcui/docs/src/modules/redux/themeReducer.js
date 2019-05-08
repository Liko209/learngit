import { ACTION_TYPES } from "../constants";
import themeInitialState from "../styles/themeInitialState";

const mapping = {
  [ACTION_TYPES.THEME_CHANGE]: (state, action) => ({
    paletteType: action.payload.paletteType || state.paletteType,
    direction: action.payload.direction || state.direction,
    paletteColors: action.payload.paletteColors || state.paletteColors
  })
};

function themeReducer(state = themeInitialState, action) {
  let newState = state;

  if (mapping[action.type]) {
    newState = mapping[action.type](state, action);
  }

  return newState;
}

export default themeReducer;
