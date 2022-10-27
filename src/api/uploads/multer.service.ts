import { randomUUID } from 'crypto';
import { AppError } from '../../libs/errors/app.error';
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/../../uploads/`);
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(new AppError('UnsupportedFileFormat', 400), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter,
});

export default upload;
