import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { Status } from 'src/enums/status.enum';
import { ObjectId } from 'mongoose';
import { ExtendedRequest } from 'src/interfaces/extended-request';
import { PaginationPipe } from 'src/custom-pipes/pagination.pipe';
import { ObjectIdValidationPipe } from 'src/custom-pipes/object-id.pipe';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: ExtendedRequest,
  ) {
    const userID = req.user.user._id;
    const comment = await this.commentService.create(createCommentDto, userID);
    return { _id: comment._id };
  }

  @Get('post/:postID')
  async findAll(
    @Param('postID', ObjectIdValidationPipe) postID: ObjectId,
    @Query('page', PaginationPipe) page: number,
    @Query('limit', PaginationPipe) limit: number,
  ) {
    const comments = await this.commentService.findAll(postID, page, limit);
    return { comments };
  }

  @Get(':commentID')
  async findOne(
    @Param('commentID', ObjectIdValidationPipe) commentID: ObjectId,
  ) {
    const comment = await this.commentService.findOne(commentID);
    return { comment };
  }

  @UseGuards(JwtGuard)
  @Patch(':commentID')
  update(
    @Param('commentID', ObjectIdValidationPipe) commentID: ObjectId,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: ExtendedRequest,
  ) {
    const userID = req.user.user._id;
    return this.commentService.update(commentID, updateCommentDto, userID);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(
    @Param('id', ObjectIdValidationPipe) id: ObjectId,
    @Req() req: ExtendedRequest,
  ) {
    const userID = req.user.user._id;
    return this.commentService.remove(id, userID);
  }
}
