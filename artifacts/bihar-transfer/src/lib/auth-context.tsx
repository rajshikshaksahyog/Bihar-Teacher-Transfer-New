import { createContext, useContext, type ReactNode } from "react";
import { useGetAuthMe } from "@workspace/api-client-react";

interface AuthContextValue {
  user: Awaited<ReturnType<typeof import("@workspace/api-client-react").getAuthMe>> | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetAuthMe({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
