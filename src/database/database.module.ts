import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  // imports: [
  //   TypeOrmModule.forRootAsync({
  //     imports: [ConfigModule],
  //     inject: [ConfigService],
  //     useFactory: (configService: ConfigService) => ({
  //       type: 'mysql',
  //       host: configService.get<string>('MYSQL_HOST'),
  //       port: configService.get<number>('MYSQL_PORT'),
  //       username: configService.get<string>('MYSQL_USER'),
  //       password: configService.get<string>('MYSQL_PASSWORD'),
  //       database: configService.get<string>('MYSQL_DATABASE'),
  //       entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  //       synchronize: configService.get<string>('NODE_ENV') === 'development',
  //       migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  //       migrationsRun: configService.get<string>('NODE_ENV') === 'production',
  //       logging: configService.get<string>('NODE_ENV') === 'development',
  //       logger: 'advanced-console',
  //       maxQueryExecutionTime: 1000
  //     }),
  //   }),
  // ],

  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        const dbUrl = configService.get<string>('DATABASE_URL');

        return {
          type: 'mysql',
          ...(dbUrl
            ? { url: dbUrl } // ✅ Railway / prod
            : {
              host: configService.get<string>('MYSQL_HOST'),
              port: configService.get<number>('MYSQL_PORT'),
              username: configService.get<string>('MYSQL_USER'),
              password: configService.get<string>('MYSQL_PASSWORD'),
              database: configService.get<string>('MYSQL_DATABASE'),
            }), // ✅ Local dev
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: !isProd, // only in dev
          migrations: [__dirname + '/../migrations/*{.ts,.js}'],
          migrationsRun: isProd, // run in prod
          logging: !isProd,
          logger: 'advanced-console',
          maxQueryExecutionTime: 1000,
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
})
export class DatabaseModule { }
