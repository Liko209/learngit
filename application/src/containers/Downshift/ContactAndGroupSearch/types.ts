/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 15:04:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import PersonModel from '@/store/models/Person';

type SelectedMember = {
  id: number;
  label: string;
  email: string;
};

type ContactAndGroupSearchProps = {
  groupId?: number;
  onSelectChange?: (item: any) => void;
  label: string;
  placeholder: string;
  error?: boolean;
  helperText?: string;
  errorEmail?: string;
  isExcludeMe?: boolean;
  hasMembers?: number[];
  messageRef?: React.RefObject<HTMLInputElement>;
  multiple?: boolean;
  autoSwitchEmail?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
};

type ViewProps = ContactAndGroupSearchProps & {
  inputValue: string;
  selectedItems: SelectedMember[];
  searchMembers: (value: string) => void;
  suggestions: SelectedMember[];
  initialSelectedItem?: SelectedMember;
  handleSelectChange: (item: any) => void;
  messageRef?: React.RefObject<HTMLInputElement>;
};

type ContactAndGroupSearchItemViewProps = {
  itemId: number;
  person: PersonModel;
  isHighlighted: boolean;
};

export {
  ViewProps,
  ContactAndGroupSearchProps,
  SelectedMember,
  ContactAndGroupSearchItemViewProps,
};
