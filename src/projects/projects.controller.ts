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
import { VendorMatchingService } from './vendor-matching.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RebuildMatchesResponseDto } from './dto/vendor-match.dto';


@Controller('projects')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.CLIENT)
export class ProjectsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly vendorMatchingService: VendorMatchingService
    ) {}

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
        // Verify the project belongs to the user and load it with required relations
        await this.projectsService.findOne(projectId, req.user.id);
        const project = await this.projectsService.findById(projectId, [
            'client', 
            'client.user',
            'services',
            'country'
        ]);
        
        // Use the optimized vendor matching service
        const matches = await this.vendorMatchingService.findAndScoreVendors(project);
        
        // Update project's last updated date
        project.updatedAt = new Date();
        await this.projectsService.update(projectId, project);

        return {
            projectId: project.id,
            matches,
            matchesCount: matches.length
        };
    }

    
    @Get(':id/matches')
    async listMatches(@Param('id', ParseUUIDPipe) projectId: string) {
        return this.vendorMatchingService.listMatches(projectId);
    }

}
