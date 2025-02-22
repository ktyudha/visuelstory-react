import { User as FirebaseUser } from "firebase/auth";
export type IMeResponse = Omit<ILoginResponse, "token">;
export interface ILoginResponse {
  displayName: string;
}

export type User = FirebaseUser;
