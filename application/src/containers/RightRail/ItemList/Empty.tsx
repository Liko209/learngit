/*
 * @Author: isaac.liu
 * @Date: 2019-01-10 15:48:20
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import {
  JuiRightShelfEmptyScreen,
  JuiFlexWrapper,
} from 'jui/pattern/EmptyScreen';
import FilesEmptyImage from '../images/Files.svg';
import EventsEmptyImage from '../images/Events.svg';
import ImagesEmptyImage from '../images/Images.svg';
import IntegrationsEmptyImage from '../images/Integration.svg';
import LinksEmptyImage from '../images/Links.svg';
import NotesEmptyImage from '../images/Notes.svg';
import PinnedEmptyImage from '../images/Pinned.svg';
import TasksEmptyImage from '../images/Tasks.svg';
import { ITEM_LIST_TYPE } from '../types';

const EMPTY_CONFIGS = {
  [ITEM_LIST_TYPE.FILE]: {
    text: 'noFilesSharedYet',
    content: 'noFileSubText',
    image: FilesEmptyImage,
  },
  [ITEM_LIST_TYPE.IMAGE]: {
    text: 'noImagesSharedYet',
    content: 'noImageSubText',
    image: ImagesEmptyImage,
  },
  [ITEM_LIST_TYPE.TASK]: {
    text: 'noTasksYet',
    content: 'noTaskSubText',
    image: TasksEmptyImage,
  },
  [ITEM_LIST_TYPE.LINK]: {
    text: 'noLinksSharedYet',
    content: 'noLinkSubText',
    image: LinksEmptyImage,
  },
  [ITEM_LIST_TYPE.NOTE]: {
    text: 'noNotesCreatedYet',
    content: 'noNoteSubText',
    image: NotesEmptyImage,
  },
  [ITEM_LIST_TYPE.EVENT]: {
    text: 'noEventsCreatedYet',
    content: 'noEventSubText',
    image: EventsEmptyImage,
  },
  [ITEM_LIST_TYPE.INTEGRATION]: {
    text: 'noIntegrationInstallationYet',
    content: 'noIntegrationSubText',
    image: IntegrationsEmptyImage,
  },
  [ITEM_LIST_TYPE.PIN]: {
    text: 'youHaveNothingPinnedYet',
    content: 'noPinSubText',
    image: PinnedEmptyImage,
  },
};

const emptyView = (type: ITEM_LIST_TYPE) => {
  const config = EMPTY_CONFIGS[type];
  if (config) {
    const { text, content, image } = config;
    return (
      <JuiFlexWrapper>
        <JuiRightShelfEmptyScreen
          actions={[]}
          text={t(text)}
          content={t(content)}
          image={image}
        />
      </JuiFlexWrapper>
    );
  }
  return <></>;
};

export { emptyView };
