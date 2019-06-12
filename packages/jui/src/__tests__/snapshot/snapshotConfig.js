const excludeDomSnapshot = {
  kind: [],
  name: ['Checkbox Button Bar', 'CheckboxButton'],
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
    // story problem
    'OutlineTextField',
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
