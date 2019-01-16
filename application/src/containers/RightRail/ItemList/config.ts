/*
 * @Author: isaac.liu
 * @Date: 2019-01-11 15:30:28
 * Copyright © RingCentral. All rights reserved.
 */

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
  empty: EmptyConfig;
};

const TAB_CONFIG: TabConfig[] = [
  {
    title: 'pinned',
    type: RIGHT_RAIL_ITEM_TYPE.PIN_POSTS,
    empty: {
      text: 'youHaveNothingPinnedYet',
      content: 'noPinSubText',
      image: PinnedEmptyImage,
    },
  },
  {
    title: 'files',
    type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
    empty: {
      text: 'noFilesSharedYet',
      content: 'noFileSubText',
      image: FilesEmptyImage,
    },
  },
  {
    title: 'images',
    type: RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES,
    empty: {
      text: 'noImagesSharedYet',
      content: 'noImageSubText',
      image: ImagesEmptyImage,
    },
  },
  {
    title: 'tasks',
    type: RIGHT_RAIL_ITEM_TYPE.TASKS,
    empty: {
      text: 'noTasksYet',
      content: 'noTaskSubText',
      image: TasksEmptyImage,
    },
  },
  {
    title: 'links',
    type: RIGHT_RAIL_ITEM_TYPE.LINKS,
    empty: {
      text: 'noLinksSharedYet',
      content: 'noLinkSubText',
      image: LinksEmptyImage,
    },
  },
  {
    title: 'notes',
    type: RIGHT_RAIL_ITEM_TYPE.NOTES,
    empty: {
      text: 'noNotesCreatedYet',
      content: 'noNoteSubText',
      image: NotesEmptyImage,
    },
  },
  {
    title: 'events',
    type: RIGHT_RAIL_ITEM_TYPE.EVENTS,
    empty: {
      text: 'noEventsCreatedYet',
      content: 'noEventSubText',
      image: EventsEmptyImage,
    },
  },
  {
    title: 'integrations',
    type: RIGHT_RAIL_ITEM_TYPE.INTEGRATIONS,
    empty: {
      text: 'noIntegrationInstallationYet',
      content: 'noIntegrationSubText',
      image: IntegrationsEmptyImage,
    },
  },
];

export { TAB_CONFIG, TabConfig, EmptyConfig };
