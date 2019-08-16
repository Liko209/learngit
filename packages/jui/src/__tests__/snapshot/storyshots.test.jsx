/*
 * @Author: wayne.zhou
 * @Date: 2019-05-15 13:43:37
 * Copyright © RingCentral. All rights reserved.
 */
import path from 'path';
import initStoryshots, {
  Stories2SnapsConverter
} from '@storybook/addon-storyshots';
import * as renderer from 'react-test-renderer';
import {
  styleSheetSerializer
} from 'jest-styled-components/serializer';
import {
  addSerializer
} from 'jest-specific-snapshot';
import {
  excludeDomSnapshot
} from './snapshotConfig';
import {
  isExcluded
} from './utils';

addSerializer(styleSheetSerializer);

jest.unmock('moize');
jest.unmock('styled-components');
jest.unmock('downshift');
jest.unmock('react-resize-detector');

const tested = new Set();

function isTested(story) {
  const hash = `${story.kind} ${story.name}`;
  if (tested.has(hash)) {
    return true;
  }
  tested.add(hash);
  return false;
}
initStoryshots({
  test: ({
    story,
    context
  }) => {
    if (isExcluded(story.kind, story.name, excludeDomSnapshot)) {
      return;
    }
    if (isTested(story)) {
      return;
    }

    const converter = new Stories2SnapsConverter({
      snapshotExtension: '.storyshot'
    });
    const snapshotFilename = converter.getSnapshotFileName(context);

    const storyElement = story.render();
    const wrapper = renderer.create(storyElement);
    expect(wrapper.toJSON()).toMatchSpecificSnapshot(
      snapshotFilename,
      `${story.kind} ${story.name}`
    );
  },
  configPath: path.resolve(__dirname, '../../../.storybook/config.test.js')
});
