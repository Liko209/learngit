/*
 * @Author: isaac.liu
 * @Date: 2019-01-11 15:30:28
 * Copyright © RingCentral. All rights reserved.
 */
import { Fragment, ComponentType } from 'react';
import { FileItem } from '../FileItem';

import FilesEmptyImage from '../images/Files.svg';
import EventsEmptyImage from '../images/Events.svg';
import ImagesEmptyImage from '../images/Images.svg';
import IntegrationsEmptyImage from '../images/Integration.svg';
import LinksEmptyImage from '../images/Links.svg';
import NotesEmptyImage from '../images/Notes.svg';
import PinnedEmptyImage from '../images/Pinned.svg';
import TasksEmptyImage from '../images/Tasks.svg';
import { RIGHT_RAIL_ITEM_TYPE } from './constants';

type EmptyConfig = {
  text: string;
  content: string;
  image: string;
};

type TabConfig = {
  title: string;
  type: RIGHT_RAIL_ITEM_TYPE;
  subheader: string;
  item: ComponentType;
  empty: EmptyConfig;
  offlinePrompt: string;
  tryAgainPrompt: string;
};

const TAB_CONFIG: TabConfig[] = [
  {
    title: 'pinned',
    type: RIGHT_RAIL_ITEM_TYPE.PIN_POSTS,
    subheader: '',
    item: Fragment,
    empty: {
      text: 'youHaveNothingPinnedYet',
      content: 'noPinSubText',
      image: PinnedEmptyImage,
    },
    offlinePrompt: 'networkErrorPinnedPrompt',
    tryAgainPrompt: 'tryAgainPinnedPrompt',
  },
  {
    title: 'files',
    type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
    subheader: 'fileListSubheader',
    item: FileItem,
    empty: {
      text: 'noFilesSharedYet',
      content: 'noFileSubText',
      image: FilesEmptyImage,
    },
    offlinePrompt: 'networkErrorFilesPrompt',
    tryAgainPrompt: 'tryAgainFilesPrompt',
  },
  {
    title: 'images',
    type: RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES,
    subheader: '',
    item: Fragment,
    empty: {
      text: 'noImagesSharedYet',
      content: 'noImageSubText',
      image: ImagesEmptyImage,
    },
    offlinePrompt: 'networkErrorImagesPrompt',
    tryAgainPrompt: 'tryAgainImagesPrompt',
  },
  {
    title: 'tasks',
    type: RIGHT_RAIL_ITEM_TYPE.TASKS,
    subheader: '',
    item: Fragment,
    empty: {
      text: 'noTasksYet',
      content: 'noTaskSubText',
      image: TasksEmptyImage,
    },
    offlinePrompt: 'networkErrorTasksPrompt',
    tryAgainPrompt: 'tryAgainTasksPrompt',
  },
  {
    title: 'links',
    type: RIGHT_RAIL_ITEM_TYPE.LINKS,
    subheader: '',
    item: Fragment,
    empty: {
      text: 'noLinksSharedYet',
      content: 'noLinkSubText',
      image: LinksEmptyImage,
    },
    offlinePrompt: 'networkErrorLinksPrompt',
    tryAgainPrompt: 'tryAgainLinksPrompt',
  },
  {
    title: 'notes',
    type: RIGHT_RAIL_ITEM_TYPE.NOTES,
    subheader: '',
    item: Fragment,
    empty: {
      text: 'noNotesCreatedYet',
      content: 'noNoteSubText',
      image: NotesEmptyImage,
    },
    offlinePrompt: 'networkErrorNotesPrompt',
    tryAgainPrompt: 'tryAgainNotesPrompt',
  },
  {
    title: 'events',
    type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
    subheader: '',
    item: Fragment,
    empty: {
      text: 'noEventsCreatedYet',
      content: 'noEventSubText',
      image: EventsEmptyImage,
    },
    offlinePrompt: 'networkErrorEventsPrompt',
    tryAgainPrompt: 'tryAgainEventsPrompt',
  },
  {
    title: 'integrations',
    type: RIGHT_RAIL_ITEM_TYPE.INTEGRATIONS,
    subheader: '',
    item: Fragment,
    empty: {
      text: 'noIntegrationInstallationYet',
      content: 'noIntegrationSubText',
      image: IntegrationsEmptyImage,
    },
    offlinePrompt: 'networkErrorIntegrationsPrompt',
    tryAgainPrompt: 'tryAgainIntegrationsPrompt',
  },
];

export { TAB_CONFIG, TabConfig, EmptyConfig };
