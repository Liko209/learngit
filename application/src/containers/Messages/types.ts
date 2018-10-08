import { RouteComponentProps } from 'react-router-dom';

type MessagesProps = {};

type MessagesViewProps = {} & RouteComponentProps<{ id: string }>;

type MessagesViewStates = {
  leftNavWidth: number;
};

export { MessagesProps, MessagesViewProps, MessagesViewStates };
