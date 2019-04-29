/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-11 09:13:39
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { shallow } from 'enzyme';
import { JuiIconButton } from 'jui/components/Buttons';
import { DownloadView } from '../Download.View';

describe('DownloadView', () => {
  it("when downlowd url match reg /s3[\\w\\d-]*.amazonaws.com/, replace it with 's3-accelerate.amazonaws.com'", () => {
    const wrapper = shallow(
      <DownloadView
        url="https://glipasialabnet-glpdevxmn.s3-ap-southeast-1.amazonaws.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D"
      />,
    );
    expect(wrapper.find(JuiIconButton).props().href).toEqual(
      'https://glipasialabnet-glpdevxmn.s3-accelerate.amazonaws.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D',
    );
  });
  it("when downlowd url doesn't match reg /s3[\\w\\d-]*.amazonaws.com/, do nothing", () => {
    const wrapper = shallow(
      <DownloadView
        url="https://s3.test.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D"
      />,
    );
    expect(wrapper.find(JuiIconButton).props().href).toEqual(
      'https://s3.test.com/modified.png?Expires=2075494478&AWSAccessKeyId=AKIAIL2TEPKHU23FQHNQ&Signature=5wbjhTL8WDmpBtrQ20RQhDog2pw%3D',
    );
  });
});
