import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  SetMetadata,
  Req,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ObjectId } from 'mongoose';
import { CommentPostDto } from './dto/comment-post.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { Status } from 'src/enums/status.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ExtendedRequest } from 'src/interfaces/extended-request';
import { PaginationPipe } from 'src/custom-pipes/pagination.pipe';
import { ParseFilesPipeCutsom } from 'src/custom-pipes/parse-file.pipe';
import { UploadService } from '../upload/upload.service';
import { ObjectIdValidationPipe } from 'src/custom-pipes/object-id.pipe';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly uploadService: UploadService,
  ) {}

  // Add a new post
  @UseGuards(JwtGuard)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @UploadedFiles(new ParseFilesPipeCutsom('image'))
    uploads: Array<Express.Multer.File>,
    @Body() createPostDto: CreatePostDto,
    @Req() req: ExtendedRequest,
  ) {
    const { _id: userID } = req.user.user;
    let images: string[] = [];
    if (uploads && uploads.length)
      images = await this.uploadService.saveFiles(uploads);
    createPostDto.images = images;

    const postID = await this.postService.create(createPostDto, userID);
    return { _id: postID };
  }

  // Get posts for your feed
  @UseGuards(JwtGuard)
  @Get('feed')
  getFeed(
    @Query('page', PaginationPipe) page: number,
    @Query('limit', PaginationPipe) limit: number,
    @Req() req: ExtendedRequest,
  ) {
    const userID = req.user.user._id;
    return this.postService.getFeed(page, limit, userID);
  }

  // Get a specific post
  @Get(':id')
  findOne(@Param('id', ObjectIdValidationPipe) id: ObjectId) {
    return this.postService.findOne(id);
  }

  // Get all posts of a specific user
  @Get('user/:id')
  getUsersPosts(
    @Query('page', PaginationPipe) page: number,
    @Query('limit', PaginationPipe) limit: number,
    @Param('id') id: ObjectId,
  ) {
    return this.postService.getUsersPosts(page, limit, id);
  }

  // Like a specific post
  @UseGuards(JwtGuard)
  @Patch('like/:id')
  likePost(
    @Param('id', ObjectIdValidationPipe) id: ObjectId,
    @Req() req: ExtendedRequest,
  ) {
    const userID = req.user.user._id;
    console.log({ userID });
    return this.postService.likePost(id, userID);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id', ObjectIdValidationPipe) id: ObjectId,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: ExtendedRequest,
  ) {
    const userID = req.user.user._id;
    return this.postService.update(id, updatePostDto, userID);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: ObjectId, @Req() req: ExtendedRequest) {
    const userID = req.user.user._id;
    return this.postService.remove(id, userID);
  }
}
