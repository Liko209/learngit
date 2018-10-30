type StreamProps = {
  groupId: number;
};

type StreamViewProps = {
  postIds: number[];
  groupId: number;
  setRowVisible: (n: number) => void;
  markAsRead: () => void;
  atBottom: () => boolean;
};

export { StreamProps, StreamViewProps };
