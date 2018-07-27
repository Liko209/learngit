/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 09:56:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '@/store';
import { REPEAT, TIMES } from '@/constants';
import Wrapper from './Wrapper';
import Title from './Title';
import Label from './Label';

const Event = (props) => {
  const {
    text,
    start,
    end,
    repeat,
    repeat_ending: repeatEnding,
    repeat_ending_after: repeatEndingAfter,
    repeat_ending_on: repeatEndingOn,
    location,
    description,
    color,
  } = props;

  const ENDING = {
    after: `for ${repeatEndingAfter} ${TIMES[repeat]}`,
    on: `until ${moment(repeatEndingOn).format('ll')}`,
  };

  return (
    <Wrapper>
      <Title color={color}>[Event] {text}</Title>
      <Label>Date & Time</Label>
      <div>
        {moment(start).calendar()} - {moment(end).format('llll')}
        {REPEAT[repeat]} {ENDING[repeatEnding]}
      </div>
      {location && [<Label key="useless1">Location</Label>, <div key="useless2">{location}</div>]}
      {description && [<Label key="useless1">Description</Label>, <div key="useless2">{description}</div>]}
    </Wrapper>
  );
};

Event.propTypes = {
  text: PropTypes.string,
  start: PropTypes.number,
  end: PropTypes.number,
  repeat: PropTypes.string,
  repeat_ending: PropTypes.string,
  repeat_ending_after: PropTypes.string,
  repeat_ending_on: PropTypes.number,
  location: PropTypes.string,
  description: PropTypes.string,
  color: PropTypes.string,
};

Event.defaultProps = {
  text: '',
  start: 0,
  end: 0,
  repeat: '',
  repeat_ending: '',
  repeat_ending_after: '',
  repeat_ending_on: 0,
  location: '',
  description: '',
  color: '',
};

export default observer((props) => {
  const { id } = props;
  const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
  const item = itemStore.get(id);
  return <Event {...item} />;
});
