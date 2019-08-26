/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-21 19:16:08
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';

type Tab = {
  title: string;
  path: string;
  automationID: string;
  component: ComponentType;
  icon?: string;
};

type Section = {
  title: string;
  tabs: Tab[];
};

type SectionTabs = {
  rootPath: string;
  sections: Section[];
};

type SingleTabs = {
  rootPath: string;
  tabs: Tab[];
};

// alternative sections or SingleTabs
type LeftNav = SectionTabs | SingleTabs;

export { LeftNav, SingleTabs, Tab, SectionTabs, Section };
