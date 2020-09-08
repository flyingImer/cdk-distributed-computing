import { Construct, Duration } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sources from '@aws-cdk/aws-lambda-event-sources';
import * as sqs from '@aws-cdk/aws-sqs';
import * as iam from '@aws-cdk/aws-iam';

export interface FanOutToLambdasViaQueueProps {
  readonly workerFunctionProps: lambda.FunctionProps;
  /**
   * A knob to tweak how many messages a work can take at a time.
   * 
   * @default - 1.
   */
  readonly batchSize?: number;

  /**
   * @default - SQS queue with 14 day retention period, allowing 2 unsuccessful dequeues before being moved to this dead-letter queue.
   */
  readonly taskPipeDeadLetterQueueConfig?: TaskPipeDeadLetterQueueConfig;

  /**
   * Note that this number should not be less than Worker Function timeout.
   * 
   * @default - same as Worker Function timeout.
   */
  readonly taskPipeVisibilityTimeout?: Duration;
}

export interface TaskPipeDeadLetterQueueConfig extends sqs.DeadLetterQueue {
  /**
   * @default - true.
   */
  readonly enabled?: boolean;
}

export class FanOutToLambdasViaQueue extends Construct {
  public readonly taskPipe: sqs.Queue;
  public readonly worker: lambda.Function;

  constructor(scope: Construct, id: string, props: FanOutToLambdasViaQueueProps) {
    super(scope, id);

    this.worker = new lambda.Function(this, 'Worker', {
      ...props.workerFunctionProps,
    });

    this.taskPipe = new sqs.Queue(this, 'TaskPipe', {
      deadLetterQueue: this.determineDeadLetterQueueProps(props),
      visibilityTimeout: props.workerFunctionProps.timeout,
    });
    this.taskPipe.grantConsumeMessages(this.worker);

    this.worker.addEventSource(new sources.SqsEventSource(this.taskPipe, {
      batchSize: props.batchSize || 1,
    }));
  }

  /**
   * Helper method to grant access to send messages to a queue to the given identity.
   * Under the hood, it simply calls the corresponding SQS api.
   * 
   * If you need more control, feel free to operate directly against the queue object.
   *
   * @param grantee Principal to grant send rights to
   */
  public grantSendMessages(grantee: iam.IGrantable): iam.Grant {
    return this.taskPipe.grantSendMessages(grantee);
  }

  public get taskPipeUrl(): string {
    return this.taskPipe.queueUrl;
  }

  private determineDeadLetterQueueProps(props: FanOutToLambdasViaQueueProps) {
    // explicitly opt-out
    if (props.taskPipeDeadLetterQueueConfig?.enabled === false) {
      return undefined;
    }

    const deadLetterQueue = props.taskPipeDeadLetterQueueConfig?.queue || new sqs.Queue(this, 'DeadLetterQueue', {
      retentionPeriod: Duration.days(14),
    });
    const maxReceiveCount = props.taskPipeDeadLetterQueueConfig?.maxReceiveCount || 2;

    return {
      queue: deadLetterQueue,
      maxReceiveCount,
    };
  }
}
