import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> { }

const RightRail = ({ match }: IProps) => {
  const id = parseInt(match.params.id, 10);
  return (
    <div style={{ backgroundColor: '#fff', height: '100%', borderLeft: '1px solid #ddd' }}>
      <strong>Conversation right rail: </strong>
      {!isNaN(id) && <div>id: {id}</div>}
    </div>
  );
};

export default withRouter(RightRail);
