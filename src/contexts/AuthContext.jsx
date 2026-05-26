/**
 * AuthContext — заглушка для Фазы 1.
 * Всегда возвращает анонимного пользователя (user: null).
 *
 * Фаза 2: заменить тело AuthProvider на реальный JWT-flow
 * (login → POST /api/auth/login, сохранить token, decode user).
 * Интерфейс контекста (useAuth) останется прежним — компоненты не трогаем.
 */
import { createContext, useContext } from "react";

const AuthContext = createContext({
  user: null,       // { id, email, org_name } | null
  isGuest: true,
  isLoading: false,
  login: async () => {},   // (email, password) => void
  logout: () => {},
});

export function AuthProvider({ children }) {
  // Phase 1: всегда гость, без сетевых вызовов
  const value = {
    user: null,
    isGuest: true,
    isLoading: false,
    login: async () => {},
    logout: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
