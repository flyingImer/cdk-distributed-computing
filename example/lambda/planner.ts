// eslint-disable-next-line import/no-extraneous-dependencies
import * as SDK from 'aws-sdk';

const TABLE_NAME = process.env.DYNAMO_SCANNER_TABLE_NAME;
if (!TABLE_NAME) {
  throw new Error('Missing DYNAMO_SCANNER_TABLE_NAME environment variable');
}

if (!process.env.DYNAMO_SCANNER_CONCURRENCY) {
  throw new Error('Missing DYNAMO_SCANNER_CONCURRENCY environment variable');
}
const CONCURRENCY: number = +process.env.DYNAMO_SCANNER_CONCURRENCY;

const TASK_PIPE_URL = process.env.TASK_PIPE_URL;
if (!TASK_PIPE_URL) {
  throw new Error('Missing TASK_PIPE_URL environment variable');
}

exports.handler = async (event: any) => {
  console.error(TABLE_NAME);
  console.error(CONCURRENCY);
  console.error(event);

  const dynamo = new SDK.DynamoDB();
  const req: SDK.DynamoDB.DescribeTableInput = {
    TableName: TABLE_NAME,
  };
  const data = await dynamo.describeTable(req).promise();
  console.error(data);

  for (let i=1; i<=CONCURRENCY; i++) {
    const params: SDK.SQS.SendMessageRequest = {
      MessageBody: JSON.stringify({
        task_id: i,
        total_tasks: CONCURRENCY,
      }),
      QueueUrl: TASK_PIPE_URL,
    };
  
    console.log(params);
  
    const sqs = new SDK.SQS();
    const sqsData = await sqs.sendMessage(params).promise();
    console.error(sqsData);
  }
};