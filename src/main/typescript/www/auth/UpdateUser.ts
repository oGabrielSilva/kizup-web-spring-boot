import { RestApiTool } from '../tools/RestApiTool';

export class UpdateUser {
  public static async userName(name: string, rest: RestApiTool) {
    const res = await rest.patch('/user/name', { name });
    const json = await res.json();
    return { res, json, status: res.status };
  }

  public static async email(email: string, password: string, rest: RestApiTool) {
    const res = await rest.patch('/user/email', { email, password });
    const json = await res.json();
    return { res, json, status: res.status };
  }

  public static async password(newPassword: string, password: string, rest: RestApiTool) {
    const res = await rest.patch('/user/password', { password, newPassword });
    const json = await res.json();
    return { res, json, status: res.status };
  }
}
