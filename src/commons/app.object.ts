export const AppObject = {
  MONGO: {
    COLLECTION: {
      USERS: 'user',
      USER_TOKENS: 'usertoken',
      PROBLEMS: 'problem',
      CATEGORIES: 'category',
      UPLOADS: 'upload',
      TESTCASES: 'testcase',
    },
  },
  PROBLEM_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    DECLINE: 'decline',
  },
  ROLES: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
  },
  COMMON_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
  ACCOUNT_STATUS: {
    NOT_VERIFIED: 'not_verified',
    VERIFIED: 'verified',
    BLOCKED: 'blocked',
  },
  PROBLEM_LEVEL: {
    EASY: 'easy',
    MEDIUM: 'medium',
  },
  APP_SCOPES: {
    PUBLIC: 'public',
    CLASS: 'class',
  },
  SOCKET: {
    ACTIONS: {
      ACTION_SUBMIT_PROBLEM: 'submit_problem',
      ACTION_RUNCODE: 'runcode',
    },
    RESPONSE: {
      RESPONSE_RUNCODE: 'response_runcode',
      OUTPUT_RUNCODE: 'ouput_runcode',
      OUTPUT_RUNCODE_TIME: 'output_runcode_time'
    }
  }
};
