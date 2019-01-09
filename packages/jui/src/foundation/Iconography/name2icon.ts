const name2icon = {
  phone: 'phone',
  meetings: 'videocam',
  star: 'star',
  star_border: 'star_border',
  bulleted_menu: 'bulleted',
  messages: 'bubble_lines',
  contacts: 'contacts',
  calendar: 'calendar',
  tasks: 'task',
  notes: 'note',
  files: 'copy',
  settings: 'settings',
  lock_open: 'unlock',
  lock: 'lock',
  new_actions: 'add',
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
  chat: 'chat',
  direct_message: 'people',
  team: 'team',
  work: 'work',
  email: 'email',
  chat_bubble: 'chat',
  download: 'download',
  unfold_more: 'unfold_more',
  mention: 'mention',
  quote: 'quote',
  edit: 'edit',
  remove: 'delete_circle',
  refresh: 'refresh',
  draft: 'draft',
  location: 'location',
  link: 'webpage',
};

export type ICON_NAME = keyof typeof name2icon;

export default name2icon;
