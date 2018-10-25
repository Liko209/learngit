type StreamProps = {
  groupId: number;
};

type StreamViewProps = {
  postIds: number[];
  setRowVisible: (n: number) => void;
};

export { StreamProps, StreamViewProps };
