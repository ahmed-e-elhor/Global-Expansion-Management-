import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1725785320000 implements MigrationInterface {
    name = 'InitialMigration1725785320000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`role\` enum ('client', 'admin', 'analyst') NOT NULL DEFAULT 'client',
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create countries table
        await queryRunner.query(`
            CREATE TABLE \`countries\` (
                \`id\` varchar(36) NOT NULL,
                \`code\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_3f5e8c9b4c8e4b1f2a3d4e5f6g\` (\`code\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create services table
        await queryRunner.query(`
            CREATE TABLE \`services\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_4f8e9c0b5c9e5b2f3a4d5e6f7h\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create clients table
        await queryRunner.query(`
            CREATE TABLE \`clients\` (
                \`id\` varchar(36) NOT NULL,
                \`company_name\` varchar(255) NOT NULL,
                \`userId\` varchar(36) NULL,
                UNIQUE INDEX \`REL_99b019339f52c63ae615358738\` (\`userId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create vendors table
        await queryRunner.query(`
            CREATE TABLE \`vendors\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`rating\` decimal(3,2) NOT NULL DEFAULT '0.00',
                \`status\` enum ('ACTIVE', 'SLA_EXPIRED') NOT NULL DEFAULT 'ACTIVE',
                \`response_sla_hours\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create projects table
        await queryRunner.query(`
            CREATE TABLE \`projects\` (
                \`id\` varchar(36) NOT NULL,
                \`budget\` decimal(10,2) NOT NULL,
                \`status\` enum ('active', 'paused', 'completed') NOT NULL DEFAULT 'active',
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`clientId\` varchar(36) NULL,
                \`country_id\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create vendor_matches table
        await queryRunner.query(`
            CREATE TABLE \`vendor_matches\` (
                \`id\` varchar(36) NOT NULL,
                \`projectId\` varchar(36) NOT NULL,
                \`vendorId\` varchar(36) NOT NULL,
                \`score\` decimal(5,2) NOT NULL,
                \`isAccepted\` tinyint NOT NULL DEFAULT 0,
                \`servicesOverlap\` int NOT NULL DEFAULT '0',
                \`vendorRating\` decimal(3,2) NOT NULL DEFAULT '0.00',
                \`slaWeight\` decimal(5,2) NOT NULL DEFAULT '0.00',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_vendor_project_unique\` (\`projectId\`, \`vendorId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create junction tables
        await queryRunner.query(`
            CREATE TABLE \`vendor_countries\` (
                \`vendor_id\` varchar(36) NOT NULL,
                \`country_id\` varchar(36) NOT NULL,
                INDEX \`IDX_vendor_countries_vendor\` (\`vendor_id\`),
                INDEX \`IDX_vendor_countries_country\` (\`country_id\`),
                PRIMARY KEY (\`vendor_id\`, \`country_id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`vendor_services\` (
                \`vendor_id\` varchar(36) NOT NULL,
                \`service_id\` varchar(36) NOT NULL,
                INDEX \`IDX_vendor_services_vendor\` (\`vendor_id\`),
                INDEX \`IDX_vendor_services_service\` (\`service_id\`),
                PRIMARY KEY (\`vendor_id\`, \`service_id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            CREATE TABLE \`project_services\` (
                \`project_id\` varchar(36) NOT NULL,
                \`service_id\` varchar(36) NOT NULL,
                INDEX \`IDX_project_services_project\` (\`project_id\`),
                INDEX \`IDX_project_services_service\` (\`service_id\`),
                PRIMARY KEY (\`project_id\`, \`service_id\`)
            ) ENGINE=InnoDB
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`clients\` 
            ADD CONSTRAINT \`FK_clients_user\` 
            FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`projects\` 
            ADD CONSTRAINT \`FK_projects_client\` 
            FOREIGN KEY (\`clientId\`) REFERENCES \`clients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`projects\` 
            ADD CONSTRAINT \`FK_projects_country\` 
            FOREIGN KEY (\`country_id\`) REFERENCES \`countries\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`vendor_matches\` 
            ADD CONSTRAINT \`FK_vendor_matches_project\` 
            FOREIGN KEY (\`projectId\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`vendor_matches\` 
            ADD CONSTRAINT \`FK_vendor_matches_vendor\` 
            FOREIGN KEY (\`vendorId\`) REFERENCES \`vendors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`vendor_countries\` 
            ADD CONSTRAINT \`FK_vendor_countries_vendor\` 
            FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`vendor_countries\` 
            ADD CONSTRAINT \`FK_vendor_countries_country\` 
            FOREIGN KEY (\`country_id\`) REFERENCES \`countries\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`vendor_services\` 
            ADD CONSTRAINT \`FK_vendor_services_vendor\` 
            FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`vendor_services\` 
            ADD CONSTRAINT \`FK_vendor_services_service\` 
            FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`project_services\` 
            ADD CONSTRAINT \`FK_project_services_project\` 
            FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`project_services\` 
            ADD CONSTRAINT \`FK_project_services_service\` 
            FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE \`project_services\` DROP FOREIGN KEY \`FK_project_services_service\``);
        await queryRunner.query(`ALTER TABLE \`project_services\` DROP FOREIGN KEY \`FK_project_services_project\``);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` DROP FOREIGN KEY \`FK_vendor_services_service\``);
        await queryRunner.query(`ALTER TABLE \`vendor_services\` DROP FOREIGN KEY \`FK_vendor_services_vendor\``);
        await queryRunner.query(`ALTER TABLE \`vendor_countries\` DROP FOREIGN KEY \`FK_vendor_countries_country\``);
        await queryRunner.query(`ALTER TABLE \`vendor_countries\` DROP FOREIGN KEY \`FK_vendor_countries_vendor\``);
        await queryRunner.query(`ALTER TABLE \`vendor_matches\` DROP FOREIGN KEY \`FK_vendor_matches_vendor\``);
        await queryRunner.query(`ALTER TABLE \`vendor_matches\` DROP FOREIGN KEY \`FK_vendor_matches_project\``);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_projects_country\``);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_projects_client\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP FOREIGN KEY \`FK_clients_user\``);

        // Drop junction tables
        await queryRunner.query(`DROP TABLE \`project_services\``);
        await queryRunner.query(`DROP TABLE \`vendor_services\``);
        await queryRunner.query(`DROP TABLE \`vendor_countries\``);

        // Drop main tables
        await queryRunner.query(`DROP TABLE \`vendor_matches\``);
        await queryRunner.query(`DROP TABLE \`projects\``);
        await queryRunner.query(`DROP TABLE \`vendors\``);
        await queryRunner.query(`DROP TABLE \`clients\``);
        await queryRunner.query(`DROP TABLE \`services\``);
        await queryRunner.query(`DROP TABLE \`countries\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
