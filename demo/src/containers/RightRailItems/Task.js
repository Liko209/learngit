/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 21:32:03
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import storeManager, { ENTITY_NAME } from '#/store';
import styled from 'styled-components';
import colorMap from '#/utils/colors';

const TaskItem = styled.div`
  padding-top: 13px;
  input[type='checkbox'] {
    vertical-align: middle;
    position: relative;
    top: 2px;
  }
  .state-text {
    color: #999;
    font-weight: 600;
  }
  .sub-title {
    color: #aaa;
    padding-left: 18px;
    padding-top: 4px;
  }
`;

const TaskTitle = styled.div`
  color: ${props => (props.color ? colorMap[props.color] : '#333')};
  text-decoration: ${props => (props.complete ? 'line-through' : 'none')};
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  .title-text {
    vertical-align: middle;
    padding-left: 8px;
  }
`;

const Task = observer(props => {
  const {
    complete_type: completeType,
    complete,
    complete_percentage: completePercentage,
    complete_people_ids: completeIds = [],
    assigned_to_ids: assigneeIds = [],
    text,
    color
  } = props;
  const checkbox = <input type="checkbox" defaultChecked={complete} />;
  const COMPLETE = {
    percentage:
      !completePercentage || completePercentage === 100 ? (
        checkbox
      ) : (
        <div className="state-text">{`${completePercentage}%`}</div>
      ),
    boolean: checkbox,
    all:
      completeIds.length === assigneeIds.length ? (
        checkbox
      ) : (
        <div className="state-text">{`${completeIds.length}/${
          assigneeIds.length
        }`}</div>
      )
  };
  const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
  const assignees = assigneeIds
    .map(assigneesId => {
      const person = personStore.get(assigneesId);
      if (!person) {
        return '';
      }
      return person.displayName;
    })
    .join(', ');
  return (
    <TaskItem>
      <TaskTitle color={color} complete={complete}>
        {COMPLETE[completeType] || checkbox}
        <div className="title-text">{text}</div>
      </TaskTitle>
      {assignees && <div className="sub-title">{assignees}</div>}
    </TaskItem>
  );
});

export default Task;
