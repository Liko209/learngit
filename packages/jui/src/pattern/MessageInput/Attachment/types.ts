/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-06 15:53:09
 * Copyright © RingCentral. All rights reserved.
 */

type AttachmentMenuItem = {
  icon: string;
  label: string;
};

type AttachmentViewProps = {
  onFileChanged: (files: FileList) => void;
  tooltip: string;
  menus: AttachmentMenuItem[];
  fileMenu: AttachmentMenuItem;
};

export { AttachmentViewProps };
