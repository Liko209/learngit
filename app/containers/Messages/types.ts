import { RouteComponentProps } from 'react-router-dom';

type MessagesProps = {};

type Params = {
  id: string;
};
type MessagesViewProps = RouteComponentProps<Params>;
type MessagesViewStates = {
  leftNavWidth: number;
};

export { MessagesProps, MessagesViewProps, MessagesViewStates };
