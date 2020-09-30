import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from "aws-sdk";

const ses = new AWS.SES({apiVersion: "2010-12-01"});

interface APIEmail {from: string, to: string[], cc: string[], bcc: string[], replyTo: string[], subject: string, body: {text: string, html: string}};

export const hello: APIGatewayProxyHandler = async (event) => {
  const options: APIEmail = JSON.parse(event.body);

  const params: AWS.SES.SendEmailRequest = {
    Source: options.from,
    Destination: {
      ToAddresses: options.to,
      CcAddresses: options.cc,
      BccAddresses: options.bcc,
    },
    ReplyToAddresses: options.replyTo,
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: JSON.stringify(options.body.text),
        },
        Html: {
          Charset: "UTF-8",
          Data: `<pre>${JSON.stringify(options.body.html)}</pre>`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: options.subject,
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Message sent successfully!`,
        input: event,
      }, null, 2),
    };
  }
  catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Message failed! ${error.message}`,
        input: event,
      }, null, 2),
    };
  }

}
