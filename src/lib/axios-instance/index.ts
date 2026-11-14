import config from "@constants/config";
import { Role } from "@modules/auth/services/role.def";
import axios, { CreateAxiosDefaults } from "axios";
import Cookies from "js-cookie";

type AxiosInstanceParams = {
  withToken: boolean;
  tokenType?: "admin" | "customer" | "auto";
};

const mapToken = new Map([
  ["admin", "token"],
  ["customer", "token-customer"],
]);

export default function axiosInstance(
  param?: AxiosInstanceParams,
  instanceSettings?: CreateAxiosDefaults
) {
  const _activeRole = Cookies.get("token") ? "admin" : "user";

  const role = (
    param?.tokenType === "auto" ? _activeRole : param?.tokenType
  ) as Role;
  const token = role ? Cookies.get(mapToken.get(role) as string) : null;

  const instance = axios.create({
    baseURL: config.BASE_API_URL,
    headers: param?.withToken
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    ...instanceSettings,
  });
  instance.interceptors.response.use(
    (resp) => resp,
    (err) => {
      if (err.response?.status === 401 && token && param?.tokenType) {
        const cookieName = mapToken.get(param?.tokenType === "auto" ? role : param.tokenType) as string;
        Cookies.remove(cookieName, { path: "/" });
        if (role === "customer" && !window.location.pathname.includes("login")) {
          window.location.assign(
            `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
          );
        }
      }

      return Promise.reject(err);
    }
  );

  return instance;
}
