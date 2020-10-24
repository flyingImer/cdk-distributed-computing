import { Stack, Construct, StackProps, App, RemovalPolicy, CfnOutput, Duration } from 'monocdk';
import { FanOutToLambdasViaQueue } from '../src';
import * as ddb from 'monocdk/aws-dynamodb';
import * as lambda from 'monocdk/aws-lambda';
import * as path from 'path';

class TestStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const scalingProps: ddb.EnableScalingProps = {
      minCapacity: 5,
      maxCapacity: 10,
    };

    const scaleOnUtils: ddb.UtilizationScalingProps = {
      targetUtilizationPercent: 90,
    };

    const table1 = new ddb.Table(this, 'Table1', {
      partitionKey: {
        name: 'year',
        type: ddb.AttributeType.NUMBER,
      },
      sortKey: {
        name: 'title',
        type: ddb.AttributeType.STRING,
      },
      readCapacity: 10,
      writeCapacity: 10,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    table1.autoScaleReadCapacity(scalingProps).scaleOnUtilization(scaleOnUtils);
    table1.autoScaleWriteCapacity(scalingProps).scaleOnUtilization(scaleOnUtils);

    new CfnOutput(this, 'TableName', {
      value: table1.tableName,
    });

    const queueFan = new FanOutToLambdasViaQueue(this, 'Scanner', {
      workerFunctionProps: {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
        handler: 'worker.handler',
        timeout: Duration.minutes(1),
        environment: {
          DYNAMO_SCANNER_TABLE_NAME: table1.tableName,
        },
      },
    });

    const planner = new lambda.Function(this, 'Planner', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      handler: 'planner.handler',
      timeout: Duration.minutes(1),
      environment: {
        DYNAMO_SCANNER_CONCURRENCY: '5',
        DYNAMO_SCANNER_TABLE_NAME: table1.tableName,
        TASK_PIPE_URL: queueFan.taskPipeUrl,
      },
    });

    queueFan.grantSendMessages(planner);
    table1.grant(planner, 'dynamodb:DescribeTable');
    table1.grantReadData(queueFan.worker);
  }
}

class TestApp extends App {
  constructor() {
    super();

    new TestStack(this, 'dynamo-scanner-example');
  }
}

new TestApp().synth();