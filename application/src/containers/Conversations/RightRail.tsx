import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const RightRail = ({ match }: IProps) => {
  const id = parseInt(match.params.id, 10);
  return (
    <div>
      <strong>Conversation right rail: </strong>
      {!isNaN(id) && <div>id: {id}</div>}
    </div>
  );
};

export default withRouter(RightRail);
