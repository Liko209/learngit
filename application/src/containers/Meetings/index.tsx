import React from 'react';

import TwoLayout from '../Layout/TwoLayout';
import Main from './Main';
import Right from './Right';

const Meetings = () => {
  return (
    <TwoLayout>
      <Main />
      <Right />
    </TwoLayout>
  );
};

export default Meetings;
