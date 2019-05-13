/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-10 14:55:06
 * @Last Modified by: Jeffery Huang
 * @Last Modified time: 2019-01-29 12:27:03
 */

import { configure, addDecorator } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";
import { withKnobs } from "@storybook/addon-knobs";
import { checkA11y } from "@storybook/addon-a11y";
import { withTests } from "@storybook/addon-jest";
import { withThemeProvider } from "../src/storybook/decorators";
import results from "../.jest-test-results.json";
import "../src/storybook/index.css";

addDecorator(
  withTests({
    results,
    filesExt: "((\\.test))?(\\.tsx?)?$"
  })
);

addDecorator(
  withInfo({
    styles: {
      header: {
        h1: {
          marginRight: "20px",
          fontSize: "25px",
          display: "inline"
        },
        body: {
          paddingTop: 0,
          paddingBottom: 0,
          marginBottom: 0
        },
        h2: {
          display: "inline",
          color: "#999"
        }
      },
      infoBody: {
        backgroundColor: "#eee",
        padding: "0px 5px",
        lineHeight: "2"
      }
    },
    inline: true,
    source: true
  })
);

addDecorator(withKnobs);

addDecorator(checkA11y);

addDecorator(withThemeProvider);

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

function loadStories() {
  requireAll(require.context("../src", true, /\.story\.tsx?$/));
}

configure(loadStories, module);
