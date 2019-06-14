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
    // didn't support modal yet
    'JuiAlert',
    'JuiConfirm',
    'Simple Menu',
    'IconList',
    'PreviewFileThumbnail',
    'IntegrationItem',
    'CheckboxButton',
    'MessageInput',
    'AttachmentList',
    'JuiDuplicateAlert',
    'JuiRightRailItemLoading',
    'ContentLoader',
    'Typography',
  ],
  matchFunction: ({ name, kind }) => {
    return /HoC/.test(kind);
  },
};

export { excludeDomSnapshot, excludeImageSnapshot, fullScreenStory };
