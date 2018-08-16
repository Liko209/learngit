import React from 'react';
import styled from 'styled-components';

import { select } from '@storybook/addon-knobs/react';

const StoryWrapper = (props: any) => {
  const Container = styled.div`
    display: flex;
    background: #e1e1e1;
    padding: 40px;
  `;

  const width = select(
    'WrapperWidth',
    {
      '256px': '256px',
      '320px': '320px',
    },
    '320px',
  );
  const Child = styled.div`
    width: ${width};
  `;

  return (
    <Container>
      <Child>
        {props.children}
      </Child>
    </Container>
  );
};

export { StoryWrapper };
export default StoryWrapper;
