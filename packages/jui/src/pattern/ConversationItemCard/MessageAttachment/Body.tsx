/*
 * @Author: isaac.liu
 * @Date: 2019-05-02 08:18:07
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import uuid from 'uuid';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';
import { Author, AuthorProps } from './Author';
import { Title, TitleProps } from './Title';
import { Field, FieldsWrapper, FieldProps } from './Field';
import { ImageView } from './ImageView';
import { Footer, FooterProps } from './Footer';
import { MarkDownView } from './base';

type BodyProps = {
  color?: string;
  text?: string;
  fields?: FieldProps[];
  image_url?: string;
} & AuthorProps &
  TitleProps &
  FooterProps;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${spacing(0, 1, 1, 0)};
`;

const TextWrapper = styled.div`
  margin-bottom: ${spacing(5)};
`;

const Body = (props: BodyProps) => {
  const { fields = [], text, image_url } = props;
  const imageURL = image_url;
  return (
    <Wrapper>
      <Author {...props} />
      <Title {...props} />
      {text && (
        <TextWrapper>
          <MarkDownView content={text} />
        </TextWrapper>
      )}
      {fields.length > 0 && (
        <FieldsWrapper>
          {fields.map((fieldLooper: FieldProps) => (
            <Field {...fieldLooper} key={uuid.v1()} />
          ))}
        </FieldsWrapper>
      )}
      {imageURL && (
        <div>
          <ImageView src={imageURL} />
        </div>
      )}
      <Footer {...props} />
    </Wrapper>
  );
};

export { Body, BodyProps };
