#!/usr/bin/env bash

which aws > /dev/null 2>&1
if [ $? == 0 ]
then
  echo "aws exist"
else
  echo "install awscli"
  pip3 --version
  pip3 install awscli --upgrade --user
  export PATH=`python3 -m site --user-base`/bin:$PATH
fi

aws --version

aws configure set aws_access_key_id $AccessKeyID

aws configure set aws_secret_access_key $SecretAccessKey

aws configure set region us-east-1

aws s3api create-bucket --bucket $BUCKET_NAME --region us-east-1

aws s3 website s3://$BUCKET_NAME/ --index-document index.html --error-document error.html

aws s3 cp ./public/ s3://$BUCKET_NAME --recursive  --acl public-read
