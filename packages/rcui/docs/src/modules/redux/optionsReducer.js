import { ACTION_TYPES, CODE_VARIANTS } from "../constants";

const mapping = {
  [ACTION_TYPES.OPTIONS_CHANGE]: (state, action) => {
    const newState = {
      codeVariant: action.payload.codeVariant || state.codeVariant
    };
    return newState;
  }
};

const initialState = {
  codeVariant: CODE_VARIANTS.JS
};

function optionsReducer(state = initialState, action) {
  let newState = state;

  if (mapping[action.type]) {
    newState = mapping[action.type](state, action);
  }

  return newState;
}

export default optionsReducer;
