import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const RightRail = ({ match }: IProps) => {
  return (
    <div>
      <strong>Conversation right rail: </strong>
      <span>id: {match.params.id}</span>
    </div>
  );
};

export default withRouter(RightRail);
