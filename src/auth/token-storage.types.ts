export type TokenStorage = {
  clearToken: () => Promise<void>;
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<void>;
};
