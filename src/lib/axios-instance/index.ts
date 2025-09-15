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
      if (err.response.status === 401 && token && param?.tokenType) {
        Cookies.remove(mapToken.get(param?.tokenType) as string);
      }

      return Promise.reject(err);
    }
  );

  return instance;
}
