import axios from "axios";

// 定义自定义事件名称
export const AUTH_EVENTS = {
  AUTH_ERROR: "auth_error",
  AUTH_LOGOUT: "auth_logout",
};

export class AuthService {
  private static token: string | null = null;

  static getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    // 始终从localStorage获取最新值，避免使用过期的缓存变量
    return localStorage.getItem("auth_token");
  }

  static setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  static clearToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  static async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post("/api/login", {
        username,
        password,
      });

      if (response.data.token) {
        this.setToken(response.data.token);
        // 登录成功后立即设置拦截器
        this.setupAxiosInterceptors();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }

  static logout(): void {
    this.clearToken();
    this.dispatchAuthEvent(AUTH_EVENTS.AUTH_LOGOUT);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 处理鉴权错误
  static handleAuthError(): void {
    this.clearToken();
    this.dispatchAuthEvent(AUTH_EVENTS.AUTH_ERROR);
  }

  // 验证token有效性
  static async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // 添加300ms延迟使加载动画更明显
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 确保请求头中有正确的token
      const token = this.getToken();
      const response = await axios.get("/api/ping", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.handleAuthError();
      }
      return false;
    }
  }

  // 发送自定义事件
  private static dispatchAuthEvent(eventName: string): void {
    if (typeof window !== "undefined") {
      const event = new CustomEvent(eventName);
      window.dispatchEvent(event);
    }
  }

  // 添加axios拦截器，处理401错误
  static setupAxiosInterceptors(): void {
    // 清除之前可能存在的拦截器
    axios.interceptors.request.eject(0);
    axios.interceptors.response.eject(0);

    if (typeof window !== "undefined") {
      // 请求拦截器，注入token
      axios.interceptors.request.use((config) => {
        const token = this.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      // 响应拦截器
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            this.handleAuthError();
          }
          return Promise.reject(error);
        }
      );
    }
  }
}
