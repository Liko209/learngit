/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:38:50
 * Copyright © RingCentral. All rights reserved.
 */

// FIXME: RCINT-11158
import applyTheme from './ThemeHandler';
import options from './options.json';

async function detect() {
  let theme;
  try {
    theme = (await applyTheme.read(options.brandThemeFile)) as {
      [brand: string]: {
        default: string;
        themes: string[];
      };
    };
  } catch (error) {
    console.error(error);
  }
  return theme;
}

export default detect;
