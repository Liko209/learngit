/*
 * @Author: wayne.zhou
 * @Date: 2019-05-15 13:43:37
 * Copyright © RingCentral. All rights reserved.
 */

import path from 'path';
import initStoryshots, {
  Stories2SnapsConverter,
} from '@storybook/addon-storyshots';
import * as renderer from 'react-test-renderer';
import { styleSheetSerializer } from 'jest-styled-components/serializer';
import { addSerializer } from 'jest-specific-snapshot';
import { excludeDomSnapshot } from './snapshotConfig';

addSerializer(styleSheetSerializer);

initStoryshots({
  asyncJest: true,
  test: ({ story, context, done }) => {
    if (
      excludeDomSnapshot.name.includes(story.name) ||
      excludeDomSnapshot.kind.includes(story.kind)
    ) {
      console.log(`skip story ${story.kind} ${story.name}`);
      done();
      return;
    }
    expect(done).toBeDefined();
    const converter = new Stories2SnapsConverter({
      snapshotExtension: '.storyshot',
    });
    const snapshotFilename = converter.getSnapshotFileName(context);

    // This is a storyOf Async (see ./required_with_context/Async.stories)
    try {
      const storyElement = story.render();
      // Mount the component
      const wrapper = renderer.create(storyElement);
      // wait until the "Async" component is updated
      setTimeout(() => {
        // wrapper.update();
        // Update the wrapper with the changes in the underlying component
        expect(wrapper.toJSON()).toMatchSpecificSnapshot(snapshotFilename);
        // expect(toJson(wrapper)).toMatchSpecificSnapshot('haha');
        // Assert the expected value and the corresponding snapshot

        // finally mark test as done
        done();
      }, 0);
    } catch {
      done();
    }
  },
  configPath: path.resolve(__dirname, '../../../.storybook/config.test.js'),
});
