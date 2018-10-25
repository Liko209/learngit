enum SeparatorType {
  'DATE',
  'NEW_MSG',
}

type Separator = {
  type: SeparatorType;
};

type DateSeparator = {
  type: SeparatorType.DATE;
  timestamp: number;
} & Separator;

type NewSeparator = {
  type: SeparatorType.NEW_MSG;
} & Separator;

enum StreamItemType {
  'POST',
  'GROUPED_POSTS',
  'DATE_SEPARATOR',
  'NEW_MSG_SEPARATOR',
}

type BaseElement = {
  type: StreamItemType;
  value: number;
  meta?: any;
};

type StreamItem = {
  type: StreamItemType;
  value: any;
  meta?: any;
};

type StreamProps = {
  groupId: number;
};

type StreamViewProps = {
  postIds: number[];
  items: StreamItem[];
};

export {
  StreamProps,
  StreamViewProps,
  StreamItemType,
  BaseElement,
  StreamItem,
  SeparatorType,
  Separator,
  DateSeparator,
  NewSeparator,
};
