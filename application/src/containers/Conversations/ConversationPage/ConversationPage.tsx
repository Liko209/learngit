import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { JuiConversationPage, JuiDivider } from 'ui-components';
import { ConversationPageHeader } from './ConversationPageHeader';

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> { }

const ConversationPageComponent = ({ match }: IProps) => {
  const id = parseInt(match.params.id, 10);
  return (
    <JuiConversationPage>
      <ConversationPageHeader id={id} />
      <JuiDivider />
    </JuiConversationPage>
  );
};

const ConversationPage = withRouter(ConversationPageComponent);

export { ConversationPage };
