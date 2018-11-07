/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 10:31:14
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  notes: string;
};

// const StyledTaskNotesWrapper = styled.div`
//   line-height: 20px;
//   height: 60px;
//   overflow: hidden;
// `;
// const StyledTaskNotes = styled.div`
//   ${typography('body1')};
//   color: ${grey('500')};
//   float: right;
//   margin-left: -5px;
//   width: 100%;
//   word-break: break-all;
//   &::before {
//     float: left;
//     width: 5px;
//     content: "";
//     height: 60px;
//   }
//   &::after {
//     float: right;
//     content: "...";
//     height: 20px;
//     line-height: 20px;
//     /* 为三个省略号的宽度 */
//     width: 3em;
//     /* 使盒子不占位置 */
//     margin-left: -3em;
//     /* 移动省略号位置 */
//     position: relative;
//     left: 100%;
//     top: -20px;
//     padding-right: 5px;
//   }
// `;
const StyledTaskNotes = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
`;

const JuiTaskNotes = (props: Props) => (
  // <StyledTaskNotesWrapper>
  //   <StyledTaskNotes>{props.notes}</StyledTaskNotes>
  // </StyledTaskNotesWrapper>
  <StyledTaskNotes>{props.notes}</StyledTaskNotes>
);

JuiTaskNotes.displayName = 'JuiTaskNotes';

export { JuiTaskNotes };
