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
  ],
  matchFunction: ({ name, kind }) => {
    return /HoC/.test(kind);
  },
};

export { excludeDomSnapshot, excludeImageSnapshot, fullScreenStory };
