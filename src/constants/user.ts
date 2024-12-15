/*1,超级管理员,SUPER_ADMIN
2,老师,TEACHER
3,学生,STUDENT
4,普通管理员,ADMIN
5,游客,GUEST
6,普通用户,USER
*/
export const ROLE_TYPE = {
  SUPER_ADMIN: 1,
  TEACHER: 2,
  STUDENT: 3,
  ADMIN: 4,
  GUEST: 5,
  USER: 6
}

export const ROLE_TYPE_MAP = {
  [ROLE_TYPE.SUPER_ADMIN]: '超级管理员',
  [ROLE_TYPE.TEACHER]: '老师',
  [ROLE_TYPE.STUDENT]: '学生',
  [ROLE_TYPE.ADMIN]: '普通管理员',
  [ROLE_TYPE.GUEST]: '游客',
  [ROLE_TYPE.USER]: '普通用户'
}
