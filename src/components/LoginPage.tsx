import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { AuthService } from "@/services/AuthService";
import toast from "react-hot-toast";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await AuthService.login(username, password);
      if (success) {
        onLoginSuccess();
        toast.success("登录成功");
      } else {
        setError("用户名或密码错误");
        toast.error("用户名或密码错误");
      }
    } catch (error) {
      setError("登录失败，请检查网络连接后重试");
      toast.error("登录失败，请检查网络连接后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 flex items-center justify-center shadow-sm">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 3V5H12V9H9V21H7V9H4V5H7V3H9Z" fill="white" />
                  <path
                    d="M14 3V15H11V19H15V21H11V19H13V17H14V15H17V13H14V3H16V13H19V15H16V17H15V19H17V21H15V19H19V17H20V13H17V3H14Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              My Note
            </h1>
            <p className="mt-2 text-gray-500">请登录以继续使用您的笔记</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 mt-2 bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? "登录中..." : "登录"}
              {!isLoading && <LogIn size={18} />}
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-sm text-gray-500">没有账号？请联系管理员创建</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
