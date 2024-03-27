import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/db/schemas/user.schema';
import { PostModule } from '../post/post.module';
import { CommentModule } from '../comment/comment.module';
import { MailerService } from '@nestjs-modules/mailer';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    forwardRef(() => PostModule),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    CommentModule,
    UploadModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
