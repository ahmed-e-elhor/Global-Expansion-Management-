import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly mailerService: MailerService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }



  @Get('test-email')
  async testEmail() {
    // await this.mailerService.sendMail({
    //   to: 'arayes017@gmail.com',
    //   subject: `New Match for Project:T est`,
    //   template: './match-notification',
    //   context: {
    //     projectName: 'Test',
    //     vendorName: 'Test',
    //     matchDetails: 'Test',
    //     year: new Date().getFullYear(),
    //   },
    // });
    return { message: 'Test email sent' };
  }
}
