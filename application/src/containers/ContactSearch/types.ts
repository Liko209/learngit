/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 15:04:39
 * Copyright © RingCentral. All rights reserved.
 */

type ContactSearchProps = {
  onChange: (item: any) => void;
  label: string;
  placeholder: string;
  error: boolean;
  helperText: string;
};

type ViewProps = {
  fetchSearch: Function;
  onChange: (item: any) => void;
  label: string;
  placeholder: string;
  error: boolean;
  helperText: string;
};

export { ViewProps, ContactSearchProps };
