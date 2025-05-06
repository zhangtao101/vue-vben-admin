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
