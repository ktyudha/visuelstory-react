export type IMeResponse = Omit<ILoginResponse, "token">;
export interface ILoginResponse {
  status: string;
  message: string;
  data: User;
}

export type User = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
};
