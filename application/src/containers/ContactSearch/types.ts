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
  onSelectChange: (item: any) => void;
  label: string;
  placeholder: string;
  error: boolean;
  helperText: string;
  errorEmail?: string;
  isExcludeMe?: boolean;
  hasMembers?: number[];
  messageRef?: React.RefObject<HTMLInputElement>;
};

type ViewProps = ContactSearchProps & {
  searchMembers: (value: string) => void;
  suggestions: SelectedMember[];
  onContactSelectChange: (item: any) => void;
  label: string;
  placeholder: string;
  error: boolean;
  helperText: string;
  errorEmail?: string;
  messageRef?: React.RefObject<HTMLInputElement>;
};

export { ViewProps, ContactSearchProps, SelectedMember };
