// /*
//  * @Author: Devin Lin (devin.lin@ringcentral.com)
//  * @Date: 2018-03-13 09:56:17
//  * Copyright © RingCentral. All rights reserved.
//  */
// import React from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import styled from 'styled-components';

// import { makeSelectItem } from '@/store/selectors/items';

// const Wrapper = styled.div`
//   font-size: 14px;
//   word-wrap: break-word;
//   cursor: pointer;
//   font-weight: 700;
//   :hover {
//     color: #0584bd !important;
//     text-decoration: underline;
//   }
// `;

// const File = (props) => {
//   const { item } = props;
//   // console.log('file: ', item);
//   const { name } = item;
//   return (
//     <Wrapper>
//       <div>[File] {name}</div>
//     </Wrapper>
//   );
// };

// File.propTypes = {
//   item: PropTypes.shape({
//     name: PropTypes.string,
//   }).isRequired,
// };

// const makeMapStateToProps = () => {
//   const selectItem = makeSelectItem();
//   const mapStateToProps = (state, props) => {
//     const { id } = props; // item id
//     const item = selectItem(state, id);
//     return {
//       item,
//     };
//   };
//   return mapStateToProps;
// };

// export default connect(makeMapStateToProps)(File);
