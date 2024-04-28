import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import { emailConfig } from '@/config';

@Injectable()
export class EmailService {
  transporter: Transporter;
  constructor(
    @Inject(emailConfig.KEY)
    private readonly emailInfo: ConfigType<typeof emailConfig>,
  ) {
    this.transporter = createTransport({
      host: this.emailInfo.host,
      port: +this.emailInfo.port,
      secure: false,
      auth: {
        user: this.emailInfo.user,
        pass: this.emailInfo.pass,
      },
    });
  }

  async sendMail({ to, subject, html }: SendMailOptions) {
    await this.transporter.sendMail({
      from: {
        name: this.emailInfo.from_name,
        address: this.emailInfo.user,
      },
      to,
      subject,
      html,
    });
  }
}
