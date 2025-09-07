import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import Mailgun from 'mailgun-js';



interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromName: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mg: any; // Using any to avoid type issues with the mailgun.js client
  private readonly domain: string;
  private readonly from: string;

  constructor(private configService: ConfigService) {
    const config: MailgunConfig = {
      apiKey: this.configService.get<string>('MAILGUN_API_KEY') || '',
      domain: this.configService.get<string>('MAILGUN_DOMAIN') || '',
      fromEmail: this.configService.get<string>('MAILGUN_FROM_EMAIL') || '',
      fromName: this.configService.get<string>('MAILGUN_FROM_NAME') || 'Expanders360',
    };

    if (!config.apiKey || !config.domain || !config.fromEmail) {
      throw new Error('Mailgun API key, domain, and from email must be configured');
    }

    const mailgun = new Mailgun({
      apiKey: config.apiKey,
      domain: config.domain,
    });

    this.mg = mailgun;

    
    this.domain = config.domain;
    this.from = `${config.fromName} <${config.fromEmail}>`;
  }

  private async compileTemplate(templateName: string, context: any): Promise<string> {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(context);
    } catch (error) {
      this.logger.error(`Failed to compile template ${templateName}:`, error);
      throw new Error(`Failed to compile email template: ${error.message}`);
    }
  }

  async sendMatchNotification(
    to: string,
    projectName: string,
    vendorName: string,
    matchDetails: string,
  ): Promise<boolean> {
    try {
      const html = await this.compileTemplate('match-notification', {
        projectName,
        vendorName,
        matchDetails,
        year: new Date().getFullYear(),
      });

      await this.mg.messages().send({
        from: this.from,
        to: [to],
        subject: `New Match for Project: ${projectName}`,
        html,
      });
      
      return true;
    } catch (error) {
      this.logger.error('Error sending match notification:', error);
      return false;
    }
  }

  async sendSlaExpirationWarning(
    to: string,
    vendorName: string,
    daysUntilExpiration: number,
  ): Promise<boolean> {
    try {
      const html = await this.compileTemplate('sla-expiration-warning', {
        vendorName,
        daysUntilExpiration,
        year: new Date().getFullYear(),
      });

      await this.mg.messages.create(this.domain, {
        from: this.from,
        to: [to],
        subject: `SLA Expiration Warning for ${vendorName}`,
        html,
      });
      
      return true;
    } catch (error) {
      this.logger.error('Error sending SLA expiration warning:', error);
      return false;
    }
  }
}
