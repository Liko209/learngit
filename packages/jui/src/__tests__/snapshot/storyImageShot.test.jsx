/*
 * @Author: wayne.zhou
 * @Date: 2019-05-15 13:43:29
 * Copyright © RingCentral. All rights reserved.
 */

import path from 'path';
import initStoryshots from '@storybook/addon-storyshots';
import { imageSnapshot } from './customImageShot';
import { excludeImageSnapshot, fullScreenStory } from './snapshotConfig';

let storybookUrl = process.env.JUI_RUL || 'http://localhost:8080';

const getScreenshotOptions = ({ context }) => {
  const { kind, name } = context;
  if (fullScreenStory.includes(`${kind} ${name}`)) return { fullPage: true };
  return {};
};

initStoryshots({
  suite: 'image storyshots',
  test: imageSnapshot({
    storybookUrl,
    getScreenshotOptions,
    excludeImageSnapshot,
    fullScreenStory,
    getMatchOptions() {
      return {
        failureThreshold: 0.01,
        failureThresholdType: 'percent',
      };
    },
  }),
  configPath: path.resolve(__dirname, '../../../.storybook/config.test.js'),
});
