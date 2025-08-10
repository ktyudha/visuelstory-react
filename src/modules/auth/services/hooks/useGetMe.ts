import axiosInstance from "@lib/axios-instance";
import { IMeResponse } from "@modules/auth/services/interfaces/login.types";
import { Role } from "@modules/auth/services/role.def";

export const getMe = async (role: Role) => {
  const url = {
    admin: "auth/admin/me",
    user: "auth/customers/me",
  }[role];

  const { data } = await axiosInstance({
    withToken: true,
    tokenType: role,
  }).get(url);

  return { data: data as IMeResponse, error: null };
};
