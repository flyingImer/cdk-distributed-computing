import { Construct, Duration } from 'monocdk';
import * as iam from 'monocdk/aws-iam';
import * as lambda from 'monocdk/aws-lambda';
import * as sources from 'monocdk/aws-lambda-event-sources';
import * as sqs from 'monocdk/aws-sqs';

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

export interface TaskPipeDeadLetterQueueConfig {
  /**
   * @default - true.
   */
  readonly enabled?: boolean;
  /**
   * @default - SQS queue with 14 day retention period, allowing 2 unsuccessful dequeues before being moved to this dead-letter queue.
   */
  readonly deadLetterQueue?: sqs.DeadLetterQueue;
}

export class FanOutToLambdasViaQueue extends Construct {
  public readonly taskPipe: sqs.Queue;
  public readonly worker: lambda.Function;
  private readonly _taskPipeDLQ?: sqs.DeadLetterQueue;

  constructor(scope: Construct, id: string, props: FanOutToLambdasViaQueueProps) {
    super(scope, id);

    this.worker = new lambda.Function(this, 'Worker', {
      ...props.workerFunctionProps,
    });

    this._taskPipeDLQ = this.determineDeadLetterQueueProps(props);

    this.taskPipe = new sqs.Queue(this, 'TaskPipe', {
      deadLetterQueue: this._taskPipeDLQ,
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

  public get taskPipeDLQ(): sqs.DeadLetterQueue | undefined {
    return this._taskPipeDLQ;
  }

  private determineDeadLetterQueueProps(props: FanOutToLambdasViaQueueProps): sqs.DeadLetterQueue | undefined {
    // explicitly opt-out
    if (props.taskPipeDeadLetterQueueConfig?.enabled === false) {
      return undefined;
    }

    const deadLetterQueue = props.taskPipeDeadLetterQueueConfig?.deadLetterQueue?.queue || new sqs.Queue(this, 'DeadLetterQueue', {
      retentionPeriod: Duration.days(14),
    });
    const maxReceiveCount = props.taskPipeDeadLetterQueueConfig?.deadLetterQueue?.maxReceiveCount || 2;

    return {
      queue: deadLetterQueue,
      maxReceiveCount,
    };
  }
}
