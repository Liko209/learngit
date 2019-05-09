/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type EditProps = {
  id: number; // post id
  disabled?: boolean;
};

type EditViewProps = {
  edit: () => void;
  disabled?: boolean;
};

export { EditProps, EditViewProps };
