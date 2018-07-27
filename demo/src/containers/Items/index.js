/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 10:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { TYPE } from '@/constants';
import Note from './Note';
import Event from './Event';
import Task from './Task';
import Link from './Link';
import Meeting from './Meeting';
import Conference from './Conference';
import Weather from './Weather';
// import Attachment from '../Attachment';

const getFiles = items => items.filter(item => TYPE[item.type_id] === 'file');

const Items = props => {
  const { items = [] } = props;
  const files = getFiles(items);
  const result = items.map(item => {
    const { id, type_id: typeId } = item;
    switch (TYPE[typeId]) {
      case 'note':
        return <Note key={id} id={id} />;
      case 'task':
        return <Task key={id} id={id} files={files} />;
      case 'event':
        return <Event key={id} id={id} />;
      case 'file':
        return null;
      //   return <Attachment key={id} id={id} files={files} />;
      case 'link':
        // eslint-disable-next-line
        return <Link key={id} id={id} />;
      case 'meeting':
        return <Meeting key={id} id={id} />;
      case 'conference':
        return <Conference key={id} id={id} />;
      case 'weather':
        return <Weather key={id} id={id} />;
      default:
        return (
          <div key={id} id={id}>
            unknown item
          </div>
        );
    }
  });
  return result;
};

Items.propTypes = {
  items: PropTypes.any.isRequired
};

export default Items;
