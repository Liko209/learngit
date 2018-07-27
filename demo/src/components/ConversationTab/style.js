import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const Wrapper = styled(NavLink)`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 25px;
  padding-left: 9px;
  font-size: 13px;
  font-weight: 600;
  color: #eee;
  text-decoration: none;
  display: ${props => (props.id === props.clickid ? 'none' : '')};
  /* font-family: proxima-nova, 'helvetica neue', helveticaneue, helvetica, arial,
    sans-serif !important; */
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  &.active {
    color: #555;
    background: #fff;
    box-sizing: border-box;
    border-radius: 3px;
  }
`;

const Text = styled.p`
  overflow: hidden;
  width: calc(100% - 48px);
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 9px;
`;

const Placeholder = styled.span`
  width: 8px;
  min-width: 8px;
`;
export { Wrapper, Text, Placeholder };
