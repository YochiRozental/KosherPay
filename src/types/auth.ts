export type Role = "user" | "admin";

export type LoginPayload = {
  phone_number: string;
  secret_code: string;
};

export type RegisterPayload = {
  phone_number: string;
  secret_code: string;
  name: string;
  bank_number: string;
  branch_number: string;
  account_number: string;
  additional_phones?: string[];

  card_number: string;
  card_expiry: string;
  card_cvv: string;
  national_id: string;
};
