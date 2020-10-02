import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

interface APIEmail {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo: string[];
  subject: string;
  body: { text: string; html: string };
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { body } = event;

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: `The following parameters are required in the request body: from, to, subject, body: {text, html}`,
          input: event,
        },
        null,
        2,
      ),
    };
  }

  const options: APIEmail = JSON.parse(body);

  const params: AWS.SES.SendEmailRequest = {
    Source: options.from,
    Destination: {
      ToAddresses: options.to,
      CcAddresses: options.cc,
      BccAddresses: options.bcc,
    },
    ReplyToAddresses: options.replyTo,
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: options.subject,
      },
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: JSON.stringify(options.body.text),
        },
        Html: {
          Charset: 'UTF-8',
          Data: JSON.stringify(options.body.html),
        },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: `Message sent successfully!`,
          input: event,
        },
        null,
        2,
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: `Message failed! ${error.message}`,
          input: event,
        },
        null,
        2,
      ),
    };
  }
};
