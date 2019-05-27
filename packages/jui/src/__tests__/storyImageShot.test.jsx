/*
 * @Author: wayne.zhou
 * @Date: 2019-05-15 13:43:29
 * Copyright © RingCentral. All rights reserved.
 */

import path from 'path';
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from './customImageShot';

const getScreenshotOptions = ({ context, url }) => {
  return {};
};
initStoryshots({
  suite: 'image storyshots',
  test: imageSnapshot({
    getScreenshotOptions,
    storybookUrl: 'http://localhost:8080',
  }),
  configPath: path.resolve(__dirname, '../../.storybook/config.test.js'),
});
