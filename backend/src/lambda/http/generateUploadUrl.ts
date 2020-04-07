import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as AWSXRay from 'aws-xray-sdk';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { setAttachmentUrl } from '../../businessLogic/todos-controller';
import { createLogger } from '../../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);
let options: AWS.S3.Types.ClientConfiguration = { signatureVersion: 'v4', };

if (process.env.IS_OFFLINE) {
  options = {
      ...options,
      s3ForcePathStyle: true,
      endpoint: 'localstack:4572',
  };
}

const bucketName = process.env.S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION);
const logger = createLogger('generateUploadUrlHandler');
const s3bucket = new XAWS.S3(options);


const generateUploadUrlHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent, ): Promise<APIGatewayProxyResult> => {
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  logger.info('Generate upload url', event);

  const todoId = event.pathParameters.todoId;
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  const imgId = uuid.v4();

  setAttachmentUrl(
    todoId,
    `https://${bucketName}.s3.amazonaws.com/${imgId}`,
    jwtToken,
  );

  const uploadUrl = s3bucket.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imgId,
    Expires: urlExpiration,
  });

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl,
    }),
  };
};

export const handler = middy(generateUploadUrlHandler).use(cors({ credentials: true }));