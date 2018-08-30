/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-13 09:56:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '#/store';
import { REPEAT, TIMES } from '#/constants';
import Wrapper from './Wrapper';
import Title from './Title';
import Label from './Label';

const Task = (props) => {
  const {
    complete_type: completeType,
    complete,
    complete_percentage: completePercentage,
    complete_people_ids: completeIds = [],
    assigned_to_ids: assigneeIds = [],
    text,
    start,
    due,
    has_due_time: hasDueTime,
    section,
    notes,
    assignees,
    repeat,
    repeat_ending: repeatEnding,
    repeat_ending_after: repeatEndingAfter,
    repeat_ending_on: repeatEndingOn,
    color,
    files,
  } = props;
  // console.log('task: ', item);
  const checkbox = <input type="checkbox" defaultChecked={complete} />;
  const COMPLETE = {
    percentage: completePercentage === 100 ? checkbox : `${completePercentage}%`,
    boolean: checkbox,
    all: completeIds.length === assigneeIds.length ? checkbox : `${completeIds.length}/${assigneeIds.length}`,
  };
  const ENDING = {
    after: `for ${repeatEndingAfter} ${TIMES[repeat]}`,
    on: `until ${moment(repeatEndingOn).format('ll')}`,
  };
  const FORMAT = hasDueTime ? 'llll' : 'll';
  return (
    <Wrapper>
      <Title color={color} complete={complete}>
        {COMPLETE[completeType]} {text}
        {start && due && <span style={{ color: '#999' }}> - x days</span>}
      </Title>
      {assignees && [<Label key="useless1">Assignees</Label>, <div key="useless2">{assignees}</div>]}
      {due && [
        <Label key="useless1">Due</Label>,
        <div key="useless2">
          {start ? `${moment(start).calendar()} -` : ''} {moment(due).format(FORMAT)}
          {REPEAT[repeat]} {ENDING[repeatEnding]}
        </div>,
      ]}
      {(section || notes) && <Label>{section || 'Description'}</Label>}
      {notes && <div>{notes}</div>}
      {files.length > 0 && <Label>Attachments</Label>}
    </Wrapper>
  );
};

Task.propTypes = {
  complete_type: PropTypes.string,
  complete: PropTypes.bool,
  complete_percentage: PropTypes.number,
  complete_people_ids: PropTypes.any,
  assigned_to_ids: PropTypes.any,
  text: PropTypes.string,
  start: PropTypes.number,
  due: PropTypes.number,
  has_due_time: PropTypes.bool,
  section: PropTypes.string,
  notes: PropTypes.string,
  repeat: PropTypes.string,
  repeat_ending: PropTypes.string,
  repeat_ending_after: PropTypes.string,
  repeat_ending_on: PropTypes.number,
  color: PropTypes.string,
  assignees: PropTypes.string,
  files: PropTypes.any,
};

Task.defaultProps = {
  complete_type: '',
  complete: false,
  complete_percentage: 0,
  complete_people_ids: [],
  assigned_to_ids: [],
  text: '',
  start: 0,
  due: 0,
  has_due_time: false,
  section: '',
  notes: '',
  repeat: '',
  repeat_ending: '',
  repeat_ending_after: '',
  repeat_ending_on: 0,
  color: '',
  assignees: '',
  files: '',
};

export default observer((props) => {
  const { id, files } = props;
  const itemStore = storeManager.getEntityMapStore(ENTITY_NAME.ITEM);
  const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
  const itemTask = itemStore.get(id) || {};
  const { assigned_to_ids: assigneesIds = [] } = itemTask;
  const assignees = assigneesIds
    .map((assigneesId) => {
      const person = personStore.get(assigneesId);
      if (!person) {
        return '';
      }
      return person.displayName;
    })
    .join(', ');
  return <Task {...itemTask} assignees={assignees} files={files} />;
});
