/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-21 10:36:23
 * Copyright © RingCentral. All rights reserved.
 */

/**
  * you can skip certain story for snapshot here,
  *
  *
   storiesOf('Avatar', module)
     .addParameters({ jest: ['Avatar'] })
     .add('Image', () => {
     return <RuiAvatar size={knobs.size()} src={avatar} />;
     })
  .add('Name', () => {
    return (
      <RuiAvatar size={knobs.size()} color={knobs.color()}>
        SH
      </RuiAvatar>
    );
  });

  * put Avatar in kind array will skip this whole stories
  * put Image into name will only skip that particular story
  */

const excludeDomSnapshot = {
  kind: [
    'Components/Animation',
    'Components/DragArea',
    'Components/VirtualizedList',
    'Components/ImageView',
    'Components/SizeDetector',
    'Components/ZoomArea',
    'Foundation/Layout',
    'Pattern/DragZoom',
    'Pattern/VirtualList',
    'Pattern/ConversationLoading',
    'Pattern/Viewer',
    'Components/Tabs',
    'Pattern/TeamSetting',
    'Pattern/ToastWrapper'
  ],
  name: [
    'JuiAlert',
    'JuiConfirm',
    'Simple Menu',
    /**
     * not component
     */
    'IconList',
    'PreviewFileThumbnail',
    'IntegrationItem',
    'CheckboxButton',
    'MessageInput',
    'AttachmentList',
    'JuiDuplicateAlert',
    /**
     * svg animation
     */
    'JuiRightRailItemLoading',
    /**
     * svg animation
     */
    'ContentLoader',
    /**
     * dom operation
     */
    'Typography',
    /**
     * svg animation
     */
    'Transcription',
    /**
     * use style-component selector
     */
    'SortableList',
    /**
     * use style-component selector
     */
    'ListItem',
    /**
     * use style-component selector
     */
    'List',
    /**
     * use style-component selector
     */
    'Section',
    /**
     * jui title component problem: didn't handle action key prop well
     */
    'Reply Call',

    /**
     * ailed prop type: Material-UI: the `fab` variant will be removed in the next major release. The `<Fab>` component is equivalent and should be used instead.
     */
    'Round Button',
    /**
     *     Warning: Failed prop type: Material-UI: you are using a deprecated typography variant: `title` that will be removed in the next major release.
     */
    'ConversationPageHeader',
    /**
     * mui slider use ref
     */
    'AudioPlayer',
    'TopBar',
    'Minimized Call',
    'Incoming Call',
    'Fab Button'
  ],
  matchFunction: ({ name, kind }) => {
    return /HoC/.test(kind);
  }
};

export { excludeDomSnapshot };
