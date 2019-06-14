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
  ],
};
const excludeImageSnapshot = {
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
  ],
  name: [
    // didn't support modal yet
    'JuiAlert',
    'JuiConfirm',
    'Simple Menu',
    'IconList',
    'PreviewFileThumbnail',
    'IntegrationItem',
  ],
  matchFunction: ({ name, kind }) => {
    return /HoC/.test(kind);
  },
};

const fullScreenStory = [
  'Pattern/ToastWrapper ToastWrapper',
  'Pattern/MessageInput JuiDuplicateAlert',
  'Pattern/TeamSetting Admin',
  'Pattern/TeamSetting Non-admin',
];

export { excludeDomSnapshot, excludeImageSnapshot, fullScreenStory };
