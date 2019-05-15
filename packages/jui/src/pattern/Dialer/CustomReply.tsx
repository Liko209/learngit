/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-05-10 14:23:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { TextFieldProps } from '@material-ui/core/TextField';
import { JuiTextarea } from '../../components/Forms/Textarea';

import { spacing, height } from '../../foundation/utils/styles';

type JuiCustomReplyProps = TextFieldProps;

const StyledCustomReply = styled(JuiTextarea)`
  && {
    textarea {
      height: ${height(25)};
      padding: ${spacing(0, 4)};
    }
    .form-label-root {
      padding: ${spacing(0, 4)};
    }
  }
` as React.ComponentType<JuiCustomReplyProps>;

const JuiCustomReply = React.memo((props: JuiCustomReplyProps) => {
  return (
    <StyledCustomReply
      InputLabelProps={{
        FormLabelClasses: {
          root: 'form-label-root',
        },
      }}
      {...props}
    />
  );
});

export { JuiCustomReply };
