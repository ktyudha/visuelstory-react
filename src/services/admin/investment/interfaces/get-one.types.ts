import { Timestamp } from "firebase/firestore";

export interface IGetOneInvestmentResponse {
  id: string;
  title: string;
  description: string;
  whatsapp: string;
  investments: Investment[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Investment {
  name: string;
  type: string;
  image: string;
}
