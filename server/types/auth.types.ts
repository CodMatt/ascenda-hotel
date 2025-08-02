export interface IUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  salutation: string;
  email: string;
  phone_num: string;
  created: Date;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  salutation?: string;
  email: string;
  phone_num: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}