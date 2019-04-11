/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 15:04:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

type SelectedMember = {
  id: number;
  label: string;
  email: string;
};

type ContactSearchProps = {
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
};

type ViewProps = ContactSearchProps & {
  inputValue: string;
  selectedItems: SelectedMember[];
  searchMembers: (value: string) => void;
  suggestions: SelectedMember[];
  initialSelectedItem?: SelectedMember;
  handleSelectChange: (item: any) => void;
  messageRef?: React.RefObject<HTMLInputElement>;
};

export { ViewProps, ContactSearchProps, SelectedMember };
