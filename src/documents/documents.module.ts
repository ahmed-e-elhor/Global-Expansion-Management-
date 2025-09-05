import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentModel, DocumentSchema } from './schemas/document.schema';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ProjectsModule } from '../projects/projects.module';
import { ClientsModule } from 'src/clients/clients.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentModel.name, schema: DocumentSchema },
    ]),
    ProjectsModule,
    ClientsModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
