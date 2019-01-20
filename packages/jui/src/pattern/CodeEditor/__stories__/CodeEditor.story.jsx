/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-11 17:23:54
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from "react";
import { storiesOf } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";

import { CodeEditor } from "../";

storiesOf("Pattern", module).add("CodeEditor", () => {
  return <CodeEditor />;
});
