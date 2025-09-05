import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    BadRequestException,
    ValidationPipe,
    UsePipes,
    UseGuards,
    Req,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';

type Document = any; // This should be properly typed in a real application

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CLIENT)
    @Post()
    async create(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        createDocumentDto: CreateDocumentDto) {
        try {
            return await this.documentsService.create(createDocumentDto);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    async findAll(@Query('projectId') projectId?: string,) {
        return this.documentsService.findAll(projectId);
    }

    @Get('search')
    async search(
        @Query('q') query: string,
        @Query('projectId') projectId?: string,
    ) {
        if (!query) {
            throw new BadRequestException('Search query is required');
        }
        return this.documentsService.search(query, projectId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const document = await this.documentsService.findOne(id);
        if (!document) {
            throw new BadRequestException('Document not found');
        }
        return document;
    }
}
