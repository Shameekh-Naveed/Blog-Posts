import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './https/auth/auth.module';
import { UserModule } from './https/user/user.module';
import { PostModule } from './https/post/post.module';
import { MulterModule } from '@nestjs/platform-express';
import { CommentModule } from './https/comment/comment.module';
import { ConfigModule } from '@nestjs/config';
import { UserSchema } from './db/schemas/user.schema';
import { UploadModule } from './https/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
    }),

    MongooseModule.forRoot(process.env.MONGO_URI),
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './uploads2',
    }),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
