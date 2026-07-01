import { api } from "./api";
import type { AuthResponse, LoginPayload, MeResponse, User } from "@/types";

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<MeResponse>("/auth/me");
    return data.user;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
