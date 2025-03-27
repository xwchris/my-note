import axios from "axios";

const API_URL = "http://" + location.hostname + ":12001/api";

export class AuthService {
  private static token: string | null = null;

  static getToken(): string | null {
    return this.token || localStorage.getItem("auth_token");
  }

  static setToken(token: string): void {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  static clearToken(): void {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  static async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      if (response.data.token) {
        this.setToken(response.data.token);
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
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
