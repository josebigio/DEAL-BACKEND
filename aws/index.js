import AWS from 'aws-sdk'
import { v4 } from 'uuid'
import { REELS_TABLE_NAME, REELS_BUCKET_NAME } from '../constants'

AWS.config.update({
  region: "us-east-1",
  accessKeyId: "AKIAS3PQFUVWZCOXAG7F",
  secretAccessKey: "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"
});

const DynamoDB = new AWS.DynamoDB();
const S3 = new AWS.S3();


export function addMeetup(title, image, address, description, callBack) {
  const id = v4()
  const params = {
    TableName: "Meetups",
    Item: {
      id: { S: id },
      title: { S: title },
      image: { S: image },
      address: { S: address },
      description: { S: description }
    },
  };
  console.log("saving meetup...", params)
  DynamoDB.putItem(params).promise()
    .then(response => {
      console.log("Success saving meetup", response)
      callBack(null, response)
    }).catch(error => {
      console.log("Error saving meetup", error)
      callBack(error, null)
    });
}

export const getAllMeetups = async () => {
  const params = {
    TableName: "Meetups",
  };

  const scanResults = [];
  let items = []
  do {
    items = await DynamoDB.scan(params).promise();
    items.Items.forEach((item) => scanResults.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== "undefined");

  return scanResults.map(entry => {
    return {
      "title": entry.title.S,
      "description": entry.description.S,
      "image": entry.image.S,
      "id": entry.id.S,
      "address": entry.address.S
    }
  })
};

export const uploadFile = async (buffer, name) => {
  const key = `s3://${REELS_BUCKET_NAME}/${name}`
  const params = {
    Body: buffer,
    Bucket: REELS_BUCKET_NAME,
    Key: `${name}`,
  };
  try {
    const s3Response = await S3.putObject(params).promise();
    console.log("success uploading file to s3", s3Response);
    const dynamoDbResponse = await saveFileToDb(key)
    return key;
  } catch (error) {
    console.log("error uploading file")
    console.log(error)
  }
}

const saveFileToDb = async (s3Key) => {
  const id = v4()
  const params = {
    TableName: REELS_TABLE_NAME,
    Item: {
      reelId: { S: id },
      userId: { S: "jose" },
      s3Key: { S: s3Key }
    },
  };
  console.log("saving s3Location...", params)
  try {
    const response = await DynamoDB.putItem(params).promise()
    console.log("Success saving s3Location to reels table", response)
    return response
  }
  catch (error) {
    console.log("Error saving meetup", error)
    return error
  }
}

export const getAllReels = async (userId) => {
  var params = {
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': { 'S': userId }
    },
    TableName: REELS_TABLE_NAME
  };
  return DynamoDB.query(params).promise()
  .then(response => response)
  .catch(error=>error)
  // try {
  //   var params = {
  //     KeyConditionExpression: 'userId = :userId',
  //     ExpressionAttributeValues: {
  //       ':userId': { 'S': userId }
  //     },
  //     TableName: REELS_TABLE_NAME
  //   };
  //   var result = await DynamoDB.query(params).promise()
  //   console.log(JSON.stringify(result))
  //   return result
  // } catch (error) {
  //   console.error(error);
  //   return error
  // }
}