import { SortEndHandler } from 'react-sortable-hoc';
import { GROUP_QUERY_TYPE } from 'sdk/service';
import { ENTITY_NAME } from '@/store';
import { SECTION_TYPE } from './constants';

type SectionProps = {
  type: SECTION_TYPE;
};

type SectionViewProps = {
  groupIds: number[];
  sortable: boolean;
  expanded: boolean;
  iconName: string;
  title: string;
  onSortEnd: SortEndHandler;
};

type SectionConfig = {
  title: string;
  iconName: string;
  entity?: string;
  entityName?: ENTITY_NAME;
  queryType?: GROUP_QUERY_TYPE;
};

type SectionConfigs = { [key in SECTION_TYPE]: SectionConfig };

export { SectionProps, SectionViewProps, SectionConfig, SectionConfigs };
