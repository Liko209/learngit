import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { JuiConversationPage, JuiDivider } from 'ui-components';
import { ConversationPageHeader } from './ConversationPageHeader';
import { ConversationStream } from './ConversationStream';

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {}

const ConversationPageComponent = ({ match }: IProps) => {
  if (!match.params.id) {
    return null;
  }
  const id = parseInt(match.params.id, 10);
  return (
    <JuiConversationPage>
      <ConversationPageHeader id={id} />
      <JuiDivider />
      <ConversationStream groupId={id} key={id} />
    </JuiConversationPage>
  );
};

const ConversationPage = withRouter(ConversationPageComponent);

export { ConversationPage };
