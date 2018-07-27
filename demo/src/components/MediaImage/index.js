/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-12 16:59:12
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Wrapper from './Wrapper';

const Item = styled.a`
  display: inline-block;
  max-width: 360px;
  height: 163px;
  border-radius: 4px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
`;

const MoreBox = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
  margin: 10px 10px 0 0;
  width: 110px;
  height: 110px;
`;
const More = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid #0c5483;
  color: #0c5483;
  cursor: pointer;
  &:hover {
    opacity: 0.76;
  }
`;

const MediaImage = ({ images }) => {
  if (!images.length) return null;

  const imageItem = (id, url) => (
    <Item key={id} href={url} target="_blank">
      <Image src={url} />
    </Item>
  );
  const isMore = images.length > 9;
  return (
    <Wrapper images={images}>
      {images.slice(0, isMore ? 8 : 9).map(image => {
        const { url } = image.versions[image.versions.length - 1];
        return imageItem(image.id, url);
      })}
      {isMore ? (
        <MoreBox>
          <More>More</More>
        </MoreBox>
      ) : null}
    </Wrapper>
  );
};

MediaImage.propTypes = {
  images: PropTypes.array.isRequired
};

MediaImage.defaultProp = {
  images: []
};

export default MediaImage;
