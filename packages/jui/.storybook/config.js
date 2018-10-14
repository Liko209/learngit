/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:41:05
 * Copyright © RingCentral. All rights reserved.
 */
import React from "react";
import { configure, setAddon, addDecorator } from "@storybook/react";
import JSXAddon from "storybook-addon-jsx";
import { withKnobs } from "@storybook/addon-knobs/react";
import "@storybook/addon-console";

import { ThemeProvider } from "../src/foundation/theme/index";

const ThemeDecorator = storyFn => {
  console.log(this);
  return (
    <ThemeProvider themeName="light">
      <div style={{ paddingTop: "25px" }}>{storyFn()}</div>
    </ThemeProvider>
  );
};

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

function loadStories() {
  requireAll(require.context("../src", true, /\.story\.tsx?$/));
}

addDecorator(withKnobs);
addDecorator(ThemeDecorator);

setAddon(JSXAddon);

configure(loadStories, module);
