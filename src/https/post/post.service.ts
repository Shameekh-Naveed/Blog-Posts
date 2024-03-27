import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { Post } from 'src/db/schemas/post.schema';
import { CommentPostDto } from './dto/comment-post.dto';
import { Comment } from 'src/db/schemas/comments.schema';
import { User } from 'src/db/schemas/user.schema';
import { UserService } from '../user/user.service';

const postsPerPage = 12;

type UserSubset = Pick<User, 'firstName' | 'lastName' | 'profilePicture'>;

@Injectable()
export class PostService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectModel('Post') private postModel: Model<Post>,
    @InjectModel('Comment') private commentModel: Model<Comment>,
  ) {
    console.log('Post service initialized');
  }

  async create(createPostDto: CreatePostDto, userID: ObjectId) {
    const owner = userID;

    let ownerType = 'User';

    const { title, content, images } = createPostDto;

    const post = new this.postModel({
      title,
      content,
      images,
      ownerType,
      owner,
    });

    await post.save();
    return post._id;
  }

  async getFeed(page: number, limit: number, userID: ObjectId) {
    const maxLimit = limit || postsPerPage;
    const start = (page - 1) * maxLimit;
    const user = await this.userService.findOne(userID);
    if (!user) throw new UnauthorizedException('User not found');
    const { dislikedPosts } = user;

    const posts = await this.postModel
      .find({
        _id: { $nin: dislikedPosts },
      })
      .sort({ createdAt: 'asc' })
      .skip(start)
      .limit(maxLimit)
      .populate<{
        owner: UserSubset;
      }>('owner', 'firstName lastName profilePicture email');

    if (!posts || posts.length === 0)
      throw new HttpException('No more posts', HttpStatus.NO_CONTENT);

    return posts;
  }

  async findOne(id: ObjectId) {
    const post = await this.postModel.findById(id).populate('owner');
    if (!post) throw new NotFoundException('Post not found');
    else return post;
  }

  async getUsersPosts(page: number, limit: number, id: ObjectId) {
    const maxLimit = limit || postsPerPage;
    const start = (page - 1) * maxLimit;
    const userPosts = await this.postModel
      .find({ owner: id })
      .sort({ createdAt: 'asc' })
      .skip(start)
      .limit(maxLimit)
      .populate('owner', 'firstName lastName profilePicture email');
    if (!userPosts || userPosts.length === 0)
      throw new HttpException('User has no more posts', HttpStatus.NO_CONTENT);
    return userPosts;
  }

  async likePost(id: ObjectId, userID: ObjectId) {
    const session = await this.postModel.db.startSession();
    session.startTransaction();
    try {
      // Update the users liked posts
      const user = await this.userService.likePost(id, userID, session);

      // Update the post's likedBy
      const post = await this.postModel.findByIdAndUpdate(
        id,
        { $addToSet: { likedBy: userID } }, // Use $addToSet instead of $push
        { session },
      );
      await session.commitTransaction();
      await session.endSession();
      return 'Success';
    } catch {
      await session.abortTransaction();
      session.endSession();
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async removeUserPosts(userID: ObjectId, session: ClientSession) {
    const posts = await this.postModel.deleteMany(
      { owner: userID },
      { session },
    );
    if (!posts) throw new BadRequestException('No posts found');
    else return 'Suceess';
  }

  async update(id: ObjectId, updatePostDto: UpdatePostDto, userID: ObjectId) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    if (post.owner.toString() != userID.toString())
      throw new UnauthorizedException(
        'You are not authorized to update this post',
      );
    console.log({ updatePostDto });
    post.title = updatePostDto.title || post.title;
    post.content = updatePostDto.content || post.content;
    await post.save();
    return post;
  }

  async remove(id: ObjectId, userID: ObjectId) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (post.owner.toString() != userID.toString())
      throw new UnauthorizedException(
        'You are not authorized to delete this post',
      );

    const session = await this.postModel.db.startSession();
    session.startTransaction();
    try {
      await this.commentModel.deleteMany({ postID: id }, { session });
      await this.postModel.findByIdAndDelete(id, { session });
      await session.commitTransaction();
      session.endSession();
      return 'Success';
    } catch {
      await session.abortTransaction();
      session.endSession();
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
