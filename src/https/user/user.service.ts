import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Mongoose,
  ObjectId,
  Schema as MongooseSchema,
  ClientSession,
} from 'mongoose';
import { User } from 'src/db/schemas/user.schema';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PostService } from '../post/post.service';
import { CommentService } from '../comment/comment.service';
import { Status } from 'src/enums/status.enum';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      profilePicture,
    } = createUserDto;
    const user = await this.userModel.findOne({ email });
    if (user)
      throw new BadRequestException('User with this email already exists');

    const userDetails = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      profilePicture,
    };

    const saveUser = new this.userModel(userDetails);
    await saveUser.save();
    return saveUser._id;
  }

  findAll() {
    return `This action returns all user balalala`;
  }

  async findOne(id: ObjectId) {
    const user = await this.userModel.findById(id);
    return user;
  }

  async getProfile(userID: ObjectId) {
    const user = await this.findOne(userID);
    if (!user) throw new NotFoundException('User not found');
    await user.populate(
      'studentDetails.universityID uniModDetails.uniID companyModDetails.companyID',
    );
    const output = user.toObject();
    delete output.password;
    return output;
  }

  async findOneWithEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async hidePost(postID: ObjectId, userID: ObjectId) {
    const user = await this.findOne(userID);
    if (!user) throw new NotFoundException('User not found');
    const { dislikedPosts } = user;
    if (dislikedPosts.includes(postID)) return 'Success';
    dislikedPosts.push(postID);
    await user.save();
    return 'Success';
  }

  async likePost(postID: ObjectId, userID: ObjectId, session: ClientSession) {
    const user = await this.userModel.findById(userID);
    if (!user) throw new NotFoundException('User not found');
    const { likedPosts } = user;
    if (likedPosts.includes(postID)) return 'Success';
    likedPosts.push(postID);
    await user.save();
    return 'Success';
  }

  async getHiddenPosts(userID: ObjectId) {
    const user = await this.userModel.findById(userID);
    if (!user) throw new NotFoundException('User not found');
    const { dislikedPosts } = user;
    return dislikedPosts;
  }
}
