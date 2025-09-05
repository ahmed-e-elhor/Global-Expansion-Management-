import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentModel } from './schemas/document.schema';
import { ProjectsService } from '../projects/projects.service';

type Document = DocumentModel & { _id: string };

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(DocumentModel.name)
    private readonly documentModel: Model<Document>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    try {
      // verify the project exists in MySQL
      await this.projectsService.findById(createDocumentDto.projectId);
      
      const createdDocument = new this.documentModel({
        ...createDocumentDto,
        tags: createDocumentDto.tags || [],
      });
      
      return await createdDocument.save();
    } catch (error) {
      this.logger.error(`Error creating document: ${error.message}`, error.stack);
      throw error; // Re-throw to let the global exception filter handle it
    }
  }

  async findAll(projectId?: string): Promise<Document[]> {
    const query = projectId ? { projectId } : {};
    return this.documentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Document | null> {
    return this.documentModel.findById(id).exec();
  }

  async search(query: string, projectId?: string): Promise<Document[]> {
    const searchQuery: any = {
      $text: { $search: query },
    };

    // if (projectId) {
    //   searchQuery.projectId = projectId;
    // }
    console.log(searchQuery);
    return this.documentModel
      .find(searchQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .exec();
  }
}
