import * as path from 'path';
import { expect as cdk_expect, haveResource, countResources } from '@aws-cdk/assert';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sqs from '@aws-cdk/aws-sqs';
import { Stack, Duration } from '@aws-cdk/core';
import { FanOutToLambdasViaQueue } from '../src';

test('creates a SQS queue (task pipe) and a Lambda Function (worker) with default settings', () => {
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
  cdk_expect(stack).to(countResources('AWS::SQS::Queue', 2));
  cdk_expect(stack).to(countResources('AWS::Lambda::Function', 1));
  // task pipe
  cdk_expect(stack).to(haveResource('AWS::SQS::Queue', {
    RedrivePolicy: {
      deadLetterTargetArn: {
        'Fn::GetAtt': [
          'ScannerDeadLetterQueue77C8DDDD',
          'Arn',
        ],
      },
      maxReceiveCount: 2,
    },
  }));
  // DLQ for task pipe
  cdk_expect(stack).to(haveResource('AWS::SQS::Queue', {
    MessageRetentionPeriod: 1209600,
  }));
  // worker function
  cdk_expect(stack).to(haveResource('AWS::Lambda::Function', {
    Handler: 'index.handler',
    Runtime: 'nodejs12.x',
  }));
});

test('creates a SQS queue (task pipe) and a Lambda Function (worker) with DLQ opt-out', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new FanOutToLambdasViaQueue(stack, 'Scanner', {
    workerFunctionProps: {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: 'index.handler',
    },
    taskPipeDeadLetterQueueConfig: {
      enabled: false,
    },
  });

  // THEN
  cdk_expect(stack).to(countResources('AWS::SQS::Queue', 1));
  cdk_expect(stack).to(countResources('AWS::Lambda::Function', 1));
  // task pipe
  cdk_expect(stack).notTo(haveResource('AWS::SQS::Queue', {
    RedrivePolicy: {
      deadLetterTargetArn: {
        'Fn::GetAtt': [
          'ScannerDeadLetterQueue77C8DDDD',
          'Arn',
        ],
      },
      maxReceiveCount: 2,
    },
  }));
  // DLQ for task pipe
  cdk_expect(stack).notTo(haveResource('AWS::SQS::Queue', {
    MessageRetentionPeriod: 1209600,
  }));
  // worker function
  cdk_expect(stack).to(haveResource('AWS::Lambda::Function', {
    Handler: 'index.handler',
    Runtime: 'nodejs12.x',
  }));
});

test('creates a SQS queue (task pipe) and a Lambda Function (worker) with Bring-Your-Own-DLQ', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  new FanOutToLambdasViaQueue(stack, 'Scanner', {
    workerFunctionProps: {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: 'index.handler',
    },
    taskPipeDeadLetterQueueConfig: {
      deadLetterQueue: {
        queue: new sqs.Queue(stack, 'DLQ', {
          retentionPeriod: Duration.days(1),
        }),
        maxReceiveCount: 3,
      },
    },
  });

  // THEN
  cdk_expect(stack).to(countResources('AWS::SQS::Queue', 2));
  cdk_expect(stack).to(countResources('AWS::Lambda::Function', 1));
  // task pipe
  cdk_expect(stack).to(haveResource('AWS::SQS::Queue', {
    RedrivePolicy: {
      deadLetterTargetArn: {
        'Fn::GetAtt': [
          'DLQ581697C4',
          'Arn',
        ],
      },
      maxReceiveCount: 3,
    },
  }));
  // DLQ for task pipe
  cdk_expect(stack).to(haveResource('AWS::SQS::Queue', {
    MessageRetentionPeriod: 86400,
  }));
  // worker function
  cdk_expect(stack).to(haveResource('AWS::Lambda::Function', {
    Handler: 'index.handler',
    Runtime: 'nodejs12.x',
  }));
});
