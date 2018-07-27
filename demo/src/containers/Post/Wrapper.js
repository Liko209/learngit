/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-28 13:45:41
 * @Last Modified by: Shining Miao (shining.miao@ringcentral.com)
 * @Last Modified time: 2018-07-02 15:13:04
 */
import styled from 'styled-components';

import Timestamp from './Timestamp';
import Actions from './Actions/Wrapper';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 15px 0;
  border-top: 1px solid #e9e9e9;
  font-size: 13px;
  margin-top: -1px;

  &:first-child {
    border-top: 0;
  }

  &:hover ${Timestamp} {
    display: none;
  }

  &:hover ${Actions} {
    /* display: inline-flex; */
    display: inline-block;
  }

  .at_mention_compose {
    color: #2f2f2f !important;
    background-color: #f5eaa9;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  a {
    word-break: break-all;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  q {
    border-left: 3px solid #8892a5;
    display: inline-block;
    padding: 0 0 0 5px;
    max-width: 100%;
  }
  q:before,
  q:after {
    content: '';
  }
`;

export default Wrapper;
