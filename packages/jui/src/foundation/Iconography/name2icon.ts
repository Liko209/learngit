const name2icon = {
  voicemail: 'voicemail',
  transcription: 'transcription',
  answer: 'answer',
  member_count: 'people',
  phone: 'phone',
  meetings: 'videocam',
  meetings_border: 'videocam_border',
  star: 'star',
  star_border: 'star_border',
  bulleted_menu: 'bulleted',
  messages: 'bubble_lines',
  messages_border: 'bubble_lines_border',
  contacts: 'contacts',
  contacts_border: 'contacts_border',
  calendar: 'calendar',
  tasks: 'task',
  notes: 'note',
  files: 'copy',
  conference: 'conference',
  settings: 'settings',
  settings_border: 'settings_border',
  lock_open: 'unlock',
  lock: 'lock',
  new_actions: 'zoom-in',
  bookmark_border: 'bookmark_border',
  bookmark: 'bookmark',
  search: 'search',
  more_vert: 'more_vert',
  more_horiz: 'more_horiz',
  event: 'event',
  thumbup: 'thumbup',
  thumbup_border: 'thumbup_border',
  delete: 'delete',
  call: 'phone',
  close: 'close',
  attachment: 'attachment',
  google: 'google',
  dropbox: 'dropbox',
  box: 'box',
  evernote: 'evernote',
  onedrive: 'onedrive',
  computer: 'computer',
  copy: 'copy',
  chevron_left: 'chevron_left',
  chevron_right: 'chevron_right',
  arrow_up: 'arrow_up',
  arrow_down: 'arrow_down',
  dashboard: 'dashboard',
  dashboard_border: 'dashboard_border',
  chat: 'chat',
  direct_message: 'people',
  team: 'team',
  work: 'work',
  email: 'email',
  chat_bubble: 'chat',
  download: 'download',
  unfold_more: 'unfold_more',
  unfold_less: 'unfold_less',
  mention: 'mention',
  quote: 'quote',
  edit: 'edit',
  remove: 'delete_circle',
  refresh: 'refresh',
  draft: 'draft',
  location: 'location',
  link: 'webpage',
  send_failure: 'refresh',
  repeat: 'repeat',
  task_incomplete: 'task_incomplete',
  image_preview: 'image-preview',
  add_member: 'add-member',
  add_team: 'add-team',
  double_chevron_right: 'double-chevron_right',
  double_chevron_left: 'double-chevron_left',
  code: 'code-snippet',
  doc: 'doc',
  excel: 'excel',
  pdf: 'pdf',
  ppt: 'ppt',
  default_file: 'default-file',
  zip: 'zip',
  default_music: 'default-music',
  default_video: 'default-video',
  default_avatar: 'default-avatar',
  pin: 'pin',
  unpin: 'unpin',
  zoom_out: 'zoom-out',
  zoom_in: 'zoom-in',
  info: 'info',
  image_broken: 'image-broken',
  forward: 'forward',
  previous: 'previous',
  tear_off: 'tear-off',
  minimize: 'minimize',
  signal_2: 'signal-2',
  hand_up: 'hand-up',
  mic: 'mic',
  keypad: 'keypad',
  hold: 'hold',
  record: 'record',
  stopRecord: 'stop-record',
  call_add: 'call-add',
  call_more: 'call-more',
  leftNavEvent: 'event-new',
  leftNavEvent_border: 'event-new_border',
  leftNavPhone: 'phone',
  leftNavPhone_border: 'phone_border',
  leftNavNote: 'note-new',
  leftNavNote_border: 'note-new_border',
  leftNavTask: 'task-new',
  leftNavTask_border: 'task-new_border',
  leftNavFile: 'file',
  leftNavFile_border: 'file_border',
  reset_zoom: 'reset-zoom',
  mic_off: 'mic-off',
  bell: 'bell',
  bubble_lines: 'bubble_lines',
  event_new: 'event-new',
  history: 'history',
  videocam: 'videocam',
  hash: 'hash',
  asterisk: 'asterisk',
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  send: 'send',
  emoji: 'emoji',
  dialer: 'dialer',
  deletenumber: 'deletenumber',
  arrow_right: 'arrow_right',
  pause: 'pause',
  play: 'play',
  incall: 'incall',
  outcall: 'outcall',
  missedcall: 'missedcall',
  blocked: 'blocked',
  unblocked: 'unblocked',
  read: 'read',
  unread: 'unread',
  dial: 'dial',
  forwardcall: 'forwardcall',
};

export type ICON_NAME = keyof typeof name2icon;

export { name2icon };
