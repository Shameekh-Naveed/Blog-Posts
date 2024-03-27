import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

@Injectable()
export class UploadService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file) throw new BadRequestException('No file provided');

    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join('uploads', fileName);

    await this.writeFile(file, filePath);

    return filePath;
  }

  async saveFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || !files.length)
      throw new BadRequestException('No files provided');

    const filePaths = await Promise.all(
      files.map((file) => this.saveFile(file)),
    );

    return filePaths;
  }

  private async writeFile(
    file: Express.Multer.File,
    filePath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const fileExtension = path.extname(originalName);
    return `${timestamp}-newFile${fileExtension}`;
  }
}
