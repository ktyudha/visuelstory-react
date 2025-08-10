import axiosInstance from "@lib/axios-instance";
import useGlobalStore from "@store/useStore";
import { useShallow } from "zustand/shallow";
import { getMe } from "@modules/auth/services/hooks/useGetMe";
import Cookies from "js-cookie";
import { Role } from "@modules/auth/services/role.def";
import { ILoginResponse } from "../interfaces/login.types";

export default function useLogin(role: Role) {
  const { setMe, setRole } = useGlobalStore(
    useShallow((state) => ({
      setMe: state.setMe,
      setRole: state.setRole,
    }))
  );

  const handleLogin = async (email: string, otp: string) => {
    console.log(email, otp);
    const { data } = await axiosInstance({ withToken: false }).post(
      `/auth/${role === "admin" ? "admin" : role}/verify-otp`,
      {
        email,
        otp,
      }
    );

    const tokenName = `token${role === "admin" ? "" : `-${role}`}`;
    Cookies.set(tokenName, data.data as string);

    const { data: meData } = await getMe(role);

    setRole(role);

    if (meData.data) {
      setMe(meData.data);
    }

    return data as ILoginResponse;
  };

  return { handleLogin };
}
