export const AppObject = {
  MONGO: {
    COLLECTION: {
      USERS: 'user',
      USER_TOKENS: 'usertoken',
      PROBLEMS: 'problem',
      CATEGORIES: 'category',
      UPLOADS: 'upload',
      TESTCASES: 'testcase',
      SUBMISSIONS: 'submission',
      CONTESTS: 'contest',
      CONTEST_HISTORIES: "contest_history",
      COMMENTS: "comment",
      REPLIES: "reply",
      REACTIONS: "reaction"
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
  CONTEST_STATUS: {
    DONE: 'done',
    NOT_JOIN: 'not_join',
    PROCESSING: 'processing'
  },
  APP_SCOPES: {
    PUBLIC: 'public',
    CLASS: 'class',
  },
  SOCKET: {
    ACTIONS: {
      ACTION_SUBMIT_PROBLEM: 'submit_problem',
      ACTION_RUNCODE: 'runcode',
      SUBMIT_CONTEST: 'submit_contest'
    },
    RESPONSE: {
      RESPONSE_RUNCODE: 'response_runcode',
      OUTPUT_RUNCODE: 'ouput_runcode',
      OUTPUT_RUNCODE_TIME: 'output_runcode_time',
      HOOK_SUBMISSION: 'hook_submission',
      JOIN_CONTEST: 'join_contest',
    }
  },
  DEFAULT_AVATAR: {
    URL: 'https://res.cloudinary.com/de6k85koo/image/upload/v1668132408/20889797_1_ic6el0.jpg'
  },
  SUBMISSION_STATUS: {
    PENDING: 'pending',
    WA: 'Wrong Answer',
    TLE: 'Time Limited Execeeded',
    RTE: 'Runtime error',
    CE: 'Compile error',
    AC: 'Accepted'
  }
}