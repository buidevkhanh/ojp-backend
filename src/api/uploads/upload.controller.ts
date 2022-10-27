import { envConfigs } from '../../configs/environment';
import { AppError } from '../../libs/errors/app.error';
import * as fs from 'fs';
import uploadService from './upload.service';

const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: envConfigs.CLOUD_NAME,
  api_key: envConfigs.CLOUD_API_KEY,
  api_secret: envConfigs.CLOUD_API_SECRET,
});

function single(file): Promise<{ url: string; id: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, (result) => {
      resolve({
        url: result.url,
        id: result.public_id,
      });
    });
  });
}

async function singleUpload(req, res, next) {
  try {
    const upload: { url: string; id: string } = await single(req.file.path);
    await uploadService.createUpload(upload.url, upload.id);
    await fs.unlinkSync(req.file.path);
    res.status(200).json(upload);
  } catch (error) {
    console.log(error);
    next(new AppError('UploadFailure', 400));
  }
}

export default {
  single,
  singleUpload,
};
