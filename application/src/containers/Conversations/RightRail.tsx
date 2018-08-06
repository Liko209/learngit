import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps<any> { }

const RightRail = ({ match }: IProps) => {
  return (
    <div>
      <div>Conversation right rail</div>
    </div>
  );
};

export default withRouter(RightRail);
