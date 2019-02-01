/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-30 14:50:19
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type Props = {
  id: number;
  sectionIndex: number;
  cellIndex: number;
  didChange: (sectionIndex: number, cellIndex: number) => void;
};

type BaseViewProps = {
  person: PersonModel;
  hasMore: boolean;
  title: string;
  terms: string[];
  onClick: (id: number) => (event: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter: (sectionIndex: number, cellIndex: number) => () => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
  setSearchSection: (items: any) => void;
  selectIndex: number[];
  sectionIndex: number;
  cellIndex: number;
};

export { Props, BaseViewProps, PersonModel };
