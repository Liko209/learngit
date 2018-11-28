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

type ContactSearchProps = {
  onChange: (item: any) => void;
  label: string;
  placeholder: string;
  error: boolean;
  helperText: string;
};

type ViewProps = {
  searchMembers: (value: string) => void;
  suggestions: SelectedMember[];
  onChange: (item: any) => void;
  label: string;
  placeholder: string;
  error: boolean;
  helperText: string;
  automationId: string;
};

export { ViewProps, ContactSearchProps, SelectedMember };
