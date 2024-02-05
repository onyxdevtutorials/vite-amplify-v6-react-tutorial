import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });

export async function handler(event, context) {
  let date = new Date();

  if (event.request.userAttributes.sub) {
    let params = {
      Item: {
        id: { S: event.request.userAttributes.sub },
        __typename: { S: "User" },
        username: { S: event.userName },
        email: { S: event.request.userAttributes.email },
        createdAt: { S: date.toISOString() },
        updatedAt: { S: date.toISOString() },
        owner: { S: event.request.userAttributes.sub },
      },
      TableName: process.env.USERTABLE,
    };

    // Call DynamoDB
    try {
      await ddbClient.send(new PutItemCommand(params));
      console.log("Success");
    } catch (err) {
      console.log("Error", err);
    }
    context.done(null, event);
  } else {
    console.log("Error: Nothing was written to DynamoDB");
    context.done(null, event);
  }
}
