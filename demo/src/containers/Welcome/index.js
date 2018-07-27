import React from 'react';
import styled from 'styled-components';
import Box from '@/components/Layout';

const Title = styled.h2`
  color: #2f2f2f;
  font-size: 32px;
  margin: 0;
`;

const Desc = styled.p`
  color: #a1a1a1;
  font-size: 18px;
`;

const Welcome = () => (
  <Box center column width="100%">
    <Title>Welcome to new Glip</Title>
    <Desc>This is your own space for organizing your work.</Desc>
  </Box>
);

export default Welcome;
