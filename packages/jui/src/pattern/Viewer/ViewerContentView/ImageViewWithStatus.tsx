/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-20 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { JuiIconography } from '../../../foundation/Iconography';
import { grey, palette } from '../../../foundation/utils';
import styled from '../../../foundation/styled-components';

const StyledImage = styled.img<{ visibility: string }>`
  visibility: ${({ visibility }) => visibility};
  width: 100%;
`;

const StyledLoadingPage = styled.div<{ background?: 'paper' }>`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
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
  return (
    <>
      <StyledImage
        src={src}
        onLoad={handleOnLoad}
        onError={handleOnError}
        visibility={Status[status] === 'error' ? 'hidden' : 'visible'}
      />
      {(Status[status] === 'error' || Status[status] === 'loading') && (
        <StyledLoadingPage background={background}>
          {Status[status] === 'error' && (
            <JuiIconography iconSize="extraLarge" iconColor={['grey', '400']}>
              image_broken
            </JuiIconography>
          )}
        </StyledLoadingPage>
      )}
    </>
  );
}

export { JuiImageWithStatusView };
