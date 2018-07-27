/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-07 14:37:56
 * Copyright © RingCentral. All rights reserved.
 */

import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
`;

const SearchInput = styled.input`
  height: 35px;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid #e1e1e1;
  background: #fff;
  margin-bottom: 15px;
`;

const LetterWrapper = styled.div`
  display: flex;
  margin: 30px 0 15px 0;
  max-width: 70%;
  min-width: 50%;
  cursor: pointer;
`;

const LetterItem = styled.div`
  display: inline-block;
  list-style: none;
  font-size: 16px;
  flex: 1;
  text-align: center;
  margin: 0 1%;
  &:hover,
  &.is_focus {
    color: #666;
    border-bottom: 2px solid blue;
  }

  &.is_disabled,
  &.is_disabled:hover {
    color: #666;
    border-bottom: none;
  }
`;

const ContactListWrapper = styled.div`
  flex: 1;
  border-top: 1px solid #f5f5f5;
`;

const ContactItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid #f5f5f5;
  padding: 12px 10px;

  &:hover {
    background-color: #eee;
    border-radius: 5px;
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #333;
  }

  p {
    color: #666;
    margin: 0;
  }
`;

export {
  Wrapper,
  SearchInput,
  LetterWrapper,
  LetterItem,
  ContactListWrapper,
  ContactItem,
};
