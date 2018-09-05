const TYPE = {
  9: 'task',
  10: 'file',
  14: 'event',
  17: 'link',
  18: 'note',
  20: 'meeting',
  41: 'conference',
  7058: 'weather',
};

const REPEAT = {
  daily: ', repeating every day',
  weekdaily: ', repeating every weekday',
  weekly: ', repeating every week',
  monthly: ', repeating every month',
  yearly: ', repeating ervery year',
};

const TIMES = {
  daily: 'days',
  weekdaily: 'weekdays',
  weekly: 'weeks',
  monthly: 'months',
  yearly: 'years',
};

const GLOBAL_STORE_DATA = {
  MODIFY_POST_ID: 'actions.modify.post.id',
  CONTACT_LIST: 'contact.list',
  IS_SWITCH: 'conversation.switch',
};

const ACTIONS_TYPE = {
  EDIT: 'edit',
  QUOTE: 'quote',
};

export { TYPE, REPEAT, TIMES, GLOBAL_STORE_DATA, ACTIONS_TYPE };
