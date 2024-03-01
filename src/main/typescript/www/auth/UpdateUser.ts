import { RestApiTool } from '../tools/RestApiTool';

export class UpdateUser {
  public static async avatar(userAvatar: Blob, rest: RestApiTool) {
    const formData = new FormData();
    formData.append('avatar', userAvatar);
    const { URL, headers } = rest.generateBase('/user/avatar');
    const res = await fetch(URL, { body: formData, headers, method: 'PATCH' });
    const json = await res.json();
    return { res, json, status: res.status };
  }

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
