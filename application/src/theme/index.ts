/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-04 11:01:19
 * Copyright © RingCentral. All rights reserved.
 */
import { detect } from 'jui/foundation/theme';

let theme:
  | {
    default: string;
    themes: string[];
  }
  | undefined;

async function detectTheme() {
  if (theme) return theme;
  const brandsTheme = await detect();
  if (brandsTheme) {
    theme = brandsTheme.rc;
  }
  return theme;
}

export default detectTheme;
