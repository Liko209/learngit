import styled from 'styled-components';

const Title = styled.div`
  font-weight: 700;
  color: ${props => (props.color ? props.color : '#333')};
  text-decoration: ${props => (props.complete ? 'line-through' : 'none')};
  cursor: pointer;
  :hover {
    color: #0584bd !important;
    text-decoration: underline;
  }
`;

export default Title;
