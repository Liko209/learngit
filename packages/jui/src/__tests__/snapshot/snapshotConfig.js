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
    'Pattern/ToastWrapper',
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
  ],
  matchFunction: ({ name, kind }) => {
    return /HoC/.test(kind);
  },
};

export { excludeDomSnapshot, excludeImageSnapshot, fullScreenStory };
