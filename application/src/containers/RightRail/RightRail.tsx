import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

type Params = {
  id: string;
};

const RightRail = withRouter(({ match }: RouteComponentProps<Params>) => {
  const id = parseInt(match.params.id, 10);
  return (
    <div
      style={{
        backgroundColor: '#fff',
        height: '100%',
        borderLeft: '1px solid #ddd',
      }}
      data-test-automation-id="rightRail"
    >
      <strong>Conversation right rail: </strong>
      {!isNaN(id) && <div>id: {id}</div>}
    </div>
  );
});

export { RightRail };
