// eslint-disable-next-line import/no-extraneous-dependencies
// import * as SDK from 'aws-sdk';

const TABLE_NAME = process.env.DYNAMO_SCANNER_TABLE_NAME;
if (!TABLE_NAME) {
  throw new Error('Missing DYNAMO_SCANNER_TABLE_NAME environment variable');
}

exports.handler = async (event: any) => {
  console.error(TABLE_NAME);
  console.error(event);

  // const dynamo = new SDK.DynamoDB();

  // const req: SDK.DynamoDB.ScanInput = {
  //     TableName: TABLE_NAME,
  //     Segment: event.segment,
  //     TotalSegments: event.totalSegments
  // };
  // await dynamo.scan(req).promise();
};