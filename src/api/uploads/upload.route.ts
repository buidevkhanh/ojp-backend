import express, { NextFunction, Request, Response } from 'express';
import upload from './multer.service';
import validate from '../../libs/middlewares/validate.mdw';
import uploadController from './upload.controller';

const _router = express.Router();

_router.post('/single-upload', [
  upload.single('image'),
  uploadController.singleUpload,
]);

export const name = 'uploads';
export default _router;
