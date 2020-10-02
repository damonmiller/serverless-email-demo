import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Email } from './Email';

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

  const messages: APIEmail[] = JSON.parse(body);

  messages.forEach((message) => {
    const email = new Email(
      message.from,
      message.to,
      message.subject,
      message.body.text,
      message.body.html,
      {
        cc: message.cc,
        bcc: message.bcc,
        replyTo: message.replyTo,
      },
    );
    email.send();
  });

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Messages queued!`,
        input: event,
      },
      null,
      2,
    ),
  };
};
