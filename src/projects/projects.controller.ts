import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Req, 
  Param, 
  ParseUUIDPipe, 
  ValidationPipe, 
  HttpCode, 
  HttpStatus,
  UsePipes
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RebuildMatchesResponseDto } from './dto/vendor-match.dto';


@Controller('projects')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.CLIENT)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    async create(
        @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
        createProjectDto: CreateProjectDto,
        @Req() req) {
        return this.projectsService.create(createProjectDto, req.user.id);
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
        return this.projectsService.findOne(id, req.user.id);
    }

    @Get()
    async findAll(@Req() req) {
        return this.projectsService.findAllForClient(req.user.id);
    }

    @Post(':id/matches/rebuild')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    async rebuildVendorMatches(
        @Param('id', ParseUUIDPipe) projectId: string,
        @Req() req
    ): Promise<RebuildMatchesResponseDto> {
        // Verify the project belongs to the user
        await this.projectsService.findOne(projectId, req.user.id);
        
        const project = await this.projectsService.findById(projectId, ['client', 'client.user']);
        // Rebuild vendor matches
        return this.projectsService.rebuildVendorMatches(project);
    }

    
    @Get(':id/matches')
    async listMatches(@Param('id', ParseUUIDPipe) projectId: string) {
        return this.projectsService.listMatches(projectId);
    }

}
