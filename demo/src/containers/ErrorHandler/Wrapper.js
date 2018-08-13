/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-22 15:32:00
 * Copyright © RingCentral. All rights reserved.
 */
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* display: flex;
  align-items: center;
  justify-content: center; */
  color: red;
  z-index: 15;
  button {
    display: inline-block;
    width: auto;
    color: #333;
    background-color: #fff;
    border-color: #ccc;
    font-size: 1.5rem;
    margin-top: 1em;
    padding: 0.625rem;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }
`;

export default Wrapper;
