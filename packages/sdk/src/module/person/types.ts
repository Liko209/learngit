/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-03 10:20:44
 * Copyright © RingCentral. All rights reserved.
 */
enum ContactType {
  GLIP_CONTACT,
  CLOUD_CONTACT,
}

type EditablePersonInfo = {
  first_name?: string;
  last_name?: string;
  homepage?: string;
  job_title?: string;
  location?: string;
};

type HeadShotInfo = {
  file: File;
  offset: string;
  crop: string;
};

export { ContactType, EditablePersonInfo, HeadShotInfo };
