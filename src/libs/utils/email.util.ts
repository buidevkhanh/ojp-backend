import * as dotenv from 'dotenv';
import * as handleBars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
dotenv.config({ path: 'src/configs/.env' });

const mailerConfigs = {
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  sercure: true,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
};

const transporter = nodemailer.createTransport(mailerConfigs);

export async function sendEmail(
  destination: string,
  subject: string,
  payloads: any,
  template: string,
) {
  const templateSource = fs.readFileSync(template, 'utf8');
  const hbsTemplate = handleBars.compile(templateSource);
  const html = hbsTemplate(payloads);
  transporter.sendMail({
    from: 'online judge system - OJP',
    to: destination,
    subject,
    html,
  });
}
