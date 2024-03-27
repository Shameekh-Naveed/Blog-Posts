import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  SetMetadata,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongoose';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { Status } from 'src/enums/status.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ExtendedRequest } from 'src/interfaces/extended-request';
import { ConfigService } from '@nestjs/config';
import { UploadService } from '../upload/upload.service';
import { ObjectIdValidationPipe } from 'src/custom-pipes/object-id.pipe';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
    private configService: ConfigService,
  ) {}

  @Patch('hidePost/:postID')
  async hidePost(
    @Param('postID', ObjectIdValidationPipe) postID: ObjectId,
    @Req() req: ExtendedRequest,
  ) {
    const userID = req.user.user._id;
    console.log({ userID });
    return await this.userService.hidePost(postID, userID);
  }

  @Get()
  async getProfile(@Req() req: ExtendedRequest) {
    const userID = req.user.user._id;
    const profile = await this.userService.getProfile(userID);
    return { profile };
  }
}
