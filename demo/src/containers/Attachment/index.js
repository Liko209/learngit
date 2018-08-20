/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-03-12 15:47:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import storeManager, { ENTITY_NAME } from '#/store';
import MediaImage from '#/components/MediaImage';

const Item = styled.div`
  padding: 5px;
`;

const Text = styled.span`
  cursor: pointer;
  display: inline-block;
  &:hover {
    color: #0c5483;
    text-decoration: underline;
  }
`;

const DownLoadBtn = styled.a`
  cursor: pointer;
`;

const imageType = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

const filterImages = files =>
  files.filter(
    file =>
      file && file.type && imageType.indexOf(file.type.toLocaleLowerCase()) > -1
  );

@observer
class Attachment extends Component {
  static propTypes = {
    files: PropTypes.array.isRequired
  };

  static defaultProp = {
    fileItems: []
  };

  render() {
    const { files = [] } = this.props;
    const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
    const fileItems = [];
    files.forEach(file => {
      const item = itemStore.get(file.id);
      if (item) {
        fileItems.push(item);
      }
    });
    if (!fileItems.length) return null;
    const images = filterImages(fileItems);

    const fileItem = (id, fileName, url) => (
      <Item key={id}>
        <Text>{fileName}</Text>
        {url && <DownLoadBtn href={url}> (Download)</DownLoadBtn>}
      </Item>
    );
    return (
      <div>
        <MediaImage images={images} />
        {fileItems.map(file => {
          if (file.id && file.versions) {
            const { length } = file.versions;
            const { download_url: downloadURL } =
              length && file.versions[length - 1];
            return fileItem(file.id, file.name, downloadURL);
          }
          return null;
        })}
      </div>
    );
  }
}

export default Attachment;
