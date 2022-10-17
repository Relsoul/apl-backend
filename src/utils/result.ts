type buildResult = {
  code: 0 | 1 | 401; // 0 错误，1:成功, 401 登录相关问题
  message: string; // 验证失败
  data: object; // 返回值
};
export function buildResult(
  code: buildResult['code'] = 1,
  message: buildResult['message'] = '',
  data: buildResult['data'] = null,
) {
  return {
    code,
    message,
    data,
  };
}
