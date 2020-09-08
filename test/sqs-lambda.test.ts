import { Stack } from '@aws-cdk/core';
import { FanOutToLambdasViaQueue } from '../src';
import { expect as cdk_expect, haveResource } from '@aws-cdk/assert';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';

test('creates a SQS queue (task pipe) and a Lambda Function (worker)', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new FanOutToLambdasViaQueue(stack, 'Scanner', {
    workerFunctionProps: {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: 'index.handler',
    },
  });

  // THEN
  cdk_expect(stack).to(haveResource('AWS::SQS::Queue'));
  cdk_expect(stack).to(haveResource('AWS::Lambda::Function'));
});