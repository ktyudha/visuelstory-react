import axiosInstance from "@lib/axios-instance";
import useGlobalStore from "@store/useStore";
import { useShallow } from "zustand/shallow";
import { Role } from "@modules/auth/services/role.def";
import { ILoginResponse } from "../interfaces/login.types";

export default function useSendOtp(role: Role) {
  const { setRole } = useGlobalStore(
    useShallow((state) => ({
      setRole: state.setRole,
    }))
  );

  const handleSendOtp = async (email: string) => {
    const { data } = await axiosInstance({ withToken: false }).post(
      `/auth/${role === "admin" ? "organizer" : role}/send-otp`,
      {
        email,
      }
    );

    setRole(role);

    return data as ILoginResponse;
  };

  return { handleSendOtp };
}
