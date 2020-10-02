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

  const options: APIEmail = JSON.parse(body);

  const email = new Email(
    options.from,
    options.to,
    options.subject,
    options.body.text,
    options.body.html,
    {
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
    },
  );

  try {
    await email.send();

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
