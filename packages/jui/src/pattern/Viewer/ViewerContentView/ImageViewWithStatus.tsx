/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-20 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { JuiIconography } from '../../../foundation/Iconography';
import { grey, palette } from '../../../foundation/utils';
import styled from '../../../foundation/styled-components';

const StyledImage = styled.img`
  width: 100%;
`;

const StyledLoadingPage = styled.div<{ background?: 'paper' }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ background }) =>
    background === 'paper' ? palette('common', 'white') : grey('100')};
`;

type JuiImageWithStatusProps = {
  src: string;
  background?: 'paper';
};

enum Status {
  loading,
  done,
  error,
}

function JuiImageWithStatusView({ src, background }: JuiImageWithStatusProps) {
  const [status, setStatus] = useState<Status>(Status['loading']);

  const handleOnLoad = () => setStatus(Status['done']);
  const handleOnError = () => setStatus(Status['error']);

  if (Status[status] !== 'error') {
    return (
      <StyledImage
        src={src}
        onLoad={handleOnLoad}
        onError={handleOnError}
      />
    )
  }

  return (Status[status] === 'error' || Status[status] === 'loading') ? (
    <StyledLoadingPage background={background}>
      {Status[status] === 'error' && (
        <JuiIconography iconSize="extraLarge" iconColor={['grey', '400']}>
          image_broken
        </JuiIconography>
      )}
    </StyledLoadingPage>) : null
}

export { JuiImageWithStatusView };
