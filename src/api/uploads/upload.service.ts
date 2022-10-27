import { UploadRepository } from './upload.repository';

async function createUpload(public_url, public_id) {
  return UploadRepository.createOne({
    publicUrl: public_url,
    publicId: public_id,
  });
}

export default {
  createUpload,
};
