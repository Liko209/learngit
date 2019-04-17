/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 15:04:39
 * Copyright © RingCentral. All rights reserved.
 */
type SelectedMember = {
  id: number;
  label: string;
  email: string;
};

type GroupSearchProps = {
  groupId?: number;
  onSelectChange?: (item: any) => void;
  label: string;
  placeholder: string;
  multiple?: boolean;
  maxLength?: number;
};

type ViewProps = GroupSearchProps & {
  inputValue: string;
  selectedItems: SelectedMember[];
  searchGroups: (value: string) => void;
  suggestions: SelectedMember[];
  handleSelectChange: (item: any) => void;
  autoFocusInput?: boolean;
};

export { ViewProps, GroupSearchProps, SelectedMember };
