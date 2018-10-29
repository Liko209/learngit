type StreamProps = {
  groupId: number;
};

type StreamViewProps = {
  postIds: number[];
  groupId: number;
  setRowVisible: (n: number) => void;
};

export { StreamProps, StreamViewProps };
