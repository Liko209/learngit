/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-03-03 13:24:17
 * @Last Modified by: Shining Miao (shining.miao@ringcentral.com)
 * @Last Modified time: 2018-04-17 21:13:58
 */
import { css } from 'styled-components';

const buttonStyles = css`
  display: inline-block;
  box-sizing: border-box;
  width: ${props => props.width};
  padding: 4px;
  text-decoration: none;
  color: #fff;
  background-color: ${props => props.backgroundColor || 'transparent'};
  border: 1px solid ${props => props.borderColor || '#fff'};
  font-size: ${props => props.fontSize};
  margin: ${props => props.margin};
  padding: ${props => props.padding};
  border-radius: 0.25rem;
  -webkit-font-smoothing: antialiased;
  -webkit-touch-callout: none;
  user-select: none;
  cursor: pointer;
  outline: 0;

  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  &:hover {
    background-color: ${props => props.backgroundHoverColor};
    border-color: 1px solid ${props => props.borderHoverColor};
  }
  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
  }
  &[disabled] {
    background-color: ${props => props.backgroundColor};
    border-color: ${props => props.backgroundColor};
    opacity: 0.65;
  }
`;

export default buttonStyles;
