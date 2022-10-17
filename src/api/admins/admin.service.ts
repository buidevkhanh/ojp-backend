import { AppObject } from '../../commons/app.object';
import jwt from '../../commons/jwt';
import { envConfigs } from '../../configs/environment';
import { AppError } from '../../libs/errors/app.error';
import { hashInformation } from '../../libs/utils/string.util';
import { UserRepository } from '../users/user.repository';

async function signIn(email: string, password: string) {
  const existAdmin = await UserRepository.findOneByCondition({
    userEmail: email,
    userRole: AppObject.ROLES.ADMIN,
  });

  if (!existAdmin) {
    throw new AppError(`PermissionDenied`, 403);
  }

  password = hashInformation(password);

  if (password === existAdmin.userPass) {
    return {
      token: jwt.signToken(
        { userOrEmail: existAdmin.username, role: existAdmin.userRole },
        envConfigs.REFRESH_TOKEN_EXPIRED,
      ),
    };
  } else {
    throw new AppError(`InvalidPassword`, 400);
  }
}

export default {
  signIn,
};
