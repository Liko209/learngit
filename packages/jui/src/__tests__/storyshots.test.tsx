import path from 'path';
import initStoryshots from '@storybook/addon-storyshots';
import * as renderer from 'react-test-renderer';
initStoryshots({
  asyncJest: true,
  test: ({ story, context, done }) => {
    expect(done).toBeDefined();

    // This is a storyOf Async (see ./required_with_context/Async.stories)
    if (true) {
      const storyElement = story.render();

      // Mount the component
      const wrapper = renderer.create(storyElement);
      // wait until the "Async" component is updated
      setTimeout(() => {
        // wrapper.update();
        // Update the wrapper with the changes in the underlying component
        expect(wrapper.toJSON()).toMatchSnapshot();
        // expect(toJson(wrapper)).toMatchSpecificSnapshot('haha');
        // Assert the expected value and the corresponding snapshot

        // finally mark test as done
        done();
      },         0);
    } else {
      // If not async just mark the test as done
      done();
    }
  },
  configPath: path.resolve(__dirname, '../../.storybook/configTest.js'),
});
