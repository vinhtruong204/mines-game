import { IApiClient } from "./IApiClient";

export class ApiClient implements IApiClient {
  constructor(private baseUrl: string, private token?: string) { }

  private async request<T>(method: string, url: string, body?: unknown): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
    };

    const response = await fetch(this.baseUrl + url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${await response.text()}`);
    }
    return response.json() as Promise<T>;
  }

  public get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return this.request<T>("GET", url + query);
  }

  public post<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>("POST", url, body);
  }

  public put<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", url, body);
  }
  
  public delete<T>(url: string): Promise<T> {
    return this.request<T>("DELETE", url);
  }
}
