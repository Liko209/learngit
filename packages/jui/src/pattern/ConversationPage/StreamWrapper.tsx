import { HTMLAttributes } from 'react';
import styled from '../../foundation/styled-components';

type JuiStreamWrapperProps = HTMLAttributes<HTMLElement>;

const JuiStreamWrapper = styled<JuiStreamWrapperProps, 'div'>('div')`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export { JuiStreamWrapper, JuiStreamWrapperProps };
