import jwt from 'jsonwebtoken';
import { envConfigs } from '../configs/environment';

function signToken(payload: any, ttl: string) {
  return jwt.sign(payload, envConfigs.JWT_SECRET, { expiresIn: ttl });
}

function verifyToken(token: string) {
  return jwt.verify(token, envConfigs.JWT_SECRET);
}

export default {
  signToken,
  verifyToken,
};
