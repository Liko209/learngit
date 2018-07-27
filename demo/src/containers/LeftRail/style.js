import styled from 'styled-components';

const ListSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const ListItem = styled.div`
  display: flex;
  height: 25px;
  &:hover span,
  &:hover p {
    background: #0570a1;
    color: #fff;
  }
`;

const Left = styled.span`
  display: flex;
  flex-basis: 100px;
  height: 25px;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  text-transform: capitalize;
`;

const Right = styled.p`
  margin: 0;
  padding: 0 12px;
  background: #f4f4f4;
  width: 355px;
  height: 25px;
  line-height: 25px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export { ListSection, ListItem, Left, Right };
