import { SYSTEM_STORAGE_KEY_TOKEN } from '../constants/system';

export class RestApiTool {
  private readonly base = '/api';

  public generateBase(path: string) {
    const headers = new Headers();
    const token = this.recoveryToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    return { URL: this.base.concat(path.startsWith('/') ? path : '/'.concat(path)), headers };
  }

  public async post(path: string, body: unknown, requestHeaders?: Headers) {
    const token = this.recoveryToken();
    const headers = new Headers();
    if (requestHeaders) {
      requestHeaders.forEach((value, key) => headers.set(key, value));
    }
    if (!headers.has('Content-Type')) {
      headers.append('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(this.base.concat(path[0] === '/' ? path : '/' + path), {
      body:
        body instanceof FormData ? body : typeof body === 'string' ? body : JSON.stringify(body),
      headers,
      method: 'POST',
    });
  }

  public async patch(path: string, body: unknown, requestHeaders?: Headers) {
    const token = this.recoveryToken();
    const headers = new Headers();
    if (requestHeaders) {
      requestHeaders.forEach((value, key) => headers.set(key, value));
    }
    if (!headers.has('Content-Type')) {
      headers.append('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(this.base.concat(path[0] === '/' ? path : '/' + path), {
      body:
        body instanceof FormData ? body : typeof body === 'string' ? body : JSON.stringify(body),
      headers,
      method: 'PATCH',
    });
  }

  public async put(path: string, body: unknown, requestHeaders?: Headers) {
    const token = this.recoveryToken();
    const headers = new Headers();
    if (requestHeaders) {
      requestHeaders.forEach((value, key) => headers.set(key, value));
    }
    if (!headers.has('Content-Type')) {
      headers.append('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(this.base.concat(path[0] === '/' ? path : '/' + path), {
      body:
        body instanceof FormData ? body : typeof body === 'string' ? body : JSON.stringify(body),
      headers,
      method: 'PUT',
    });
  }

  public async delete(path: string, requestHeaders?: Headers) {
    const token = this.recoveryToken();
    const headers = new Headers();
    if (requestHeaders) {
      requestHeaders.forEach((value, key) => headers.set(key, value));
    }
    if (!headers.has('Content-Type')) {
      headers.append('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(this.base.concat(path[0] === '/' ? path : '/' + path), {
      headers,
      method: 'DELETE',
    });
  }

  public async signOut() {
    const res = await this.delete('/session/sign-out');
    return res.status === 200;
  }

  private recoveryToken() {
    try {
      return localStorage.getItem(SYSTEM_STORAGE_KEY_TOKEN);
    } catch (error) {
      return null;
    }
  }

  public static updateToken(token: string) {
    if (!token) {
      console.error('TOKEN_INVALID');
      return;
    }
    localStorage.setItem(SYSTEM_STORAGE_KEY_TOKEN, token);
  }
}
