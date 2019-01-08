/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 19:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { t } from 'i18next';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { JuiTaskCheckbox } from 'jui/pattern/ConversationItemCard/ConversationItemCardHeader';
import {
  JuiTaskSection,
  JuiTaskNotes,
  JuiTaskAvatarNames,
  JuiTaskContent,
  JuiTimeMessage,
} from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import {
  JuiFileWithExpand,
  JuiExpandImage,
} from 'jui/pattern/ConversationCard/Files';

import { AvatarName } from './AvatarName';
import { getDateAndTime, getDurationTimeText } from '../helper';
import { ViewProps, FileType, ExtendFileItem } from './types';
import { recentlyTwoDayAndOther } from '@/utils/date';

type taskViewProps = WithNamespaces & ViewProps;

const downloadBtn = (downloadUrl: string) => (
  <JuiIconButton
    component="a"
    download={true}
    href={downloadUrl}
    variant="plain"
    tooltipTitle={t('download')}
  >
    get_app
  </JuiIconButton>
);

const FILE_COMPS = {
  [FileType.image]: (file: ExtendFileItem, props: ViewProps) => {
    const { item, previewUrl } = file;
    const { id, name, downloadUrl, deactivated } = item;
    return (
      !deactivated && (
        <JuiExpandImage
          key={id}
          previewUrl={previewUrl}
          fileName={name}
          i18UnfoldLess={t('collapse')}
          i18UnfoldMore={t('expand')}
          Actions={downloadBtn(downloadUrl)}
          ImageActions={downloadBtn(downloadUrl)}
        />
      )
    );
  },
  [FileType.others]: (file: ExtendFileItem) => {
    const { item } = file;
    const { name, downloadUrl, id, deactivated } = item;
    return (
      !deactivated && (
        <JuiFileWithExpand
          key={id}
          fileName={name}
          Actions={downloadBtn(downloadUrl)}
        />
      )
    );
  },
};

@observer
class Task extends React.Component<taskViewProps> {
  private get _taskAvatarNames() {
    const { task } = this.props;
    const { assignedToIds } = task;

    const assignedIds = assignedToIds ? assignedToIds.slice(0, 2) : [];

    return assignedIds.map((assignedId: number) => (
      <AvatarName key={assignedId} id={assignedId} />
    ));
  }

  private _getTitleText(text: string) {
    const { task } = this.props;
    const {
      completeType,
      completePeopleIds,
      assignedToIds,
      completePercentage,
    } = task;

    switch (completeType) {
      case 'all':
        return `${completePeopleIds ? completePeopleIds.length : 0}/${
          assignedToIds.length
        } ${text}`;
      case 'percentage':
        return `${completePercentage || 0}% ${text}`;
      default:
        return text;
    }
  }

  render() {
    const { task, files, t } = this.props;
    const {
      section,
      color,
      text,
      notes,
      complete,
      assignedToIds,
      start,
      due,
      repeat,
      repeatEndingAfter,
      repeatEnding,
      repeatEndingOn,
    } = task;
    let startTime = '';
    let endTime = '';
    const hasTime = start && due;
    if (hasTime) {
      startTime = recentlyTwoDayAndOther(start);
      endTime = getDateAndTime(due);
    }
    const timeText = getDurationTimeText(
      repeat,
      repeatEndingAfter,
      repeatEndingOn,
      repeatEnding,
    );

    return (
      <JuiConversationItemCard
        complete={complete}
        title={this._getTitleText(text)}
        titleColor={color}
        Icon={<JuiTaskCheckbox checked={complete || false} />}
      >
        {hasTime && (
          <JuiTaskContent title={t('due')}>
            <JuiTimeMessage time={`${startTime} - ${endTime} ${timeText}`} />
          </JuiTaskContent>
        )}
        {assignedToIds && assignedToIds.length > 0 && (
          <JuiTaskContent title={t('assignee')}>
            <JuiTaskAvatarNames
              count={assignedToIds && assignedToIds.length}
              otherText={t('avatarnamesWithOthers', {
                count: assignedToIds.length - 2,
              })}
            >
              {this._taskAvatarNames}
            </JuiTaskAvatarNames>
          </JuiTaskContent>
        )}
        {section && (
          <JuiTaskContent title={t('section')}>
            <JuiTaskSection section={section} />
          </JuiTaskContent>
        )}
        {notes && (
          <JuiTaskContent title={t('descriptionNotes')}>
            <JuiTaskNotes notes={notes} />
          </JuiTaskContent>
        )}
        {files && files.length > 0 && (
          <JuiTaskContent title={t('Attachments')}>
            {files.map((file: ExtendFileItem) => {
              return FILE_COMPS[file.type](file, this.props);
            })}
          </JuiTaskContent>
        )}
      </JuiConversationItemCard>
    );
  }
}

const TaskView = translate('translations')(Task);

export { TaskView };
