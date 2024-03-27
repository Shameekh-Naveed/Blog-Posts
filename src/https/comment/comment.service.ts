import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { Comment } from 'src/db/schemas/comments.schema';

@Injectable()
export class CommentService {
  constructor(@InjectModel('Comment') private commentModel: Model<Comment>) {}

  async create(createCommentDto: CreateCommentDto, userID: ObjectId) {
    const { postID, content } = createCommentDto;
    const newComment = new this.commentModel({
      postID,
      userID,
      content,
    });
    await newComment.save();
    return newComment;
  }

  async findOne(id: ObjectId) {
    const comment = await this.commentModel.findOne(id);
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async findAll(postID: ObjectId, page: number, limit: number) {
    const maxLimit = limit;
    const start = (page - 1) * maxLimit;

    return await this.commentModel
      .find({ postID })
      .sort({ createdAt: 'asc' })
      .skip(start)
      .limit(maxLimit)
      .populate('userID', 'firstName lastName profilePicture email');
  }

  async count(postID: ObjectId) {
    return await this.commentModel.countDocuments({ postID });
  }

  async update(
    id: ObjectId,
    updateCommentDto: UpdateCommentDto,
    userID: ObjectId,
  ) {
    const comment = await this.findOne(id);
    if (comment.userID.toString() !== userID.toString())
      throw new UnauthorizedException('Error updating comment');
    comment.content = updateCommentDto.content;
    await comment.save();
    return comment;
  }

  async remove(id: ObjectId, userID: ObjectId) {
    const comment = await this.commentModel.findOneAndDelete({
      _id: id,
      userID,
    });
    if (!comment) throw new UnauthorizedException('Error deleting comment');
    return 'Success';
  }
}
