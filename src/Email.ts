import * as AWS from 'aws-sdk';

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

interface EmailOptions {
  cc?: string[];
  bcc?: string[];
  replyTo?: string[];
}

export class Email {
  private cc?: string[];

  private bcc?: string[];

  private replyTo?: string[];

  constructor(
    private from: string,
    private to: string[],
    private subject: string,
    private textBody: string,
    private htmlBody: string,
    options?: EmailOptions,
  ) {
    if (options) {
      this.cc = options.cc;
      this.bcc = options.bcc;
      this.replyTo = options.replyTo;
    }
  }

  send = async (): Promise<AWS.SES.SendEmailResponse> => {
    const options: AWS.SES.SendEmailRequest = {
      Source: this.from,
      Destination: {
        ToAddresses: this.to,
        CcAddresses: this.cc,
        BccAddresses: this.bcc,
      },
      ReplyToAddresses: this.replyTo,
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: this.subject,
        },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: JSON.stringify(this.textBody),
          },
          Html: {
            Charset: 'UTF-8',
            Data: JSON.stringify(this.htmlBody),
          },
        },
      },
    };

    return ses.sendEmail(options).promise();
  };
}
