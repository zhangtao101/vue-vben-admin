import { requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password: string;
    loginName: string;
    rememberMe: boolean;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    Authorization: string;
    user: {
      // 创建时间
      ctime: string;
      // 描述
      discription: string;
      // id
      id: number;
      // 是否删除
      isDelete: number;
      // 是否启用
      isEnable: number;
      perName: string;
      // 用户编码
      userCode: string;
      // 用户名
      userName: string;
      // 工号
      workNumber: string;
    };
  }
}

/**
 * 登录
 */
export async function loginApi(data: any) {
  return requestClient.post<AuthApi.LoginResult>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/authenticate`,
    data,
  );
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

/**
 * 授权认证接口
 * 用于提交授权码完成系统授权，业务 code 非 200 时由响应拦截器抛出异常
 * @param authorCode 授权码
 * @returns 授权结果，成功时返回接口 data（当前为 null）
 * @since 2026-09-24
 */
export async function testUserAuthorApi(authorCode: string) {
  return requestClient.get<null>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/testUserAuthor?authorCode=${authorCode}`,
  );
}

/**
 * 本地授权校验
 * 校验当前环境是否已授权，data 为 1 表示已认证，-1 表示未认证；
 * 未校验时接口返回 code 402 并由响应拦截器抛出异常
 * @returns 授权状态，1 已认证，-1 未认证
 * @since 2026-09-24
 */
export async function getUserAuthorFlagApi() {
  return requestClient.get<number>(
    `${import.meta.env.VITE_GLOB_MES_USER}/sys/user/getUserAuthorFlag`,
  );
}
