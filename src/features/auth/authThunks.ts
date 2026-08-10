import { createAsyncThunk } from "@reduxjs/toolkit";

import * as authApi from "../../api/authApi";
import * as meApi from "../../api/meApi";

import type {
  RegisterPayload,
  UpdateMePayload,
  UserMe,
  UserMeApiResponse,
  UserFormData,
} from "../../types";

type RejectValue = string;

const extractMsg = (e: any, fallback: string) =>
  e?.response?.data?.detail?.message ||
  e?.response?.data?.detail ||
  e?.message ||
  fallback;

export const loginUser = createAsyncThunk<
  UserMe,
  { phone: string; secret: string },
  { rejectValue: RejectValue }
>("auth/loginUser", async (userData, { rejectWithValue }) => {
  try {
    const res = await authApi.loginUser(userData.phone, userData.secret);

    if (!res?.success) {
      return rejectWithValue(res?.message || "שגיאה בהתחברות");
    }

    localStorage.setItem("accessToken", res.access_token);
    localStorage.setItem("refreshToken", res.refresh_token);

    const me: UserMeApiResponse = await meApi.getMe();
    if (!me.success) {
      return rejectWithValue(me.message || "התחברת אבל טעינת פרופיל נכשלה");
    }

    return me.user;
  } catch (e: any) {
    return rejectWithValue(extractMsg(e, "שגיאה בהתחברות"));
  }
});

export const fetchMe = createAsyncThunk<
  UserMe,
  void,
  { rejectValue: RejectValue }
>("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const res: UserMeApiResponse = await meApi.getMe();
    if (!res.success)
      return rejectWithValue(res.message || "שגיאה בטעינת פרופיל");
    return res.user;
  } catch (e: any) {
    return rejectWithValue(extractMsg(e, "שגיאה בטעינת פרופיל"));
  }
});

export const updateUser = createAsyncThunk<
  UserMe,
  UserFormData,
  { rejectValue: RejectValue }
>("auth/updateUser", async (form, { rejectWithValue }) => {
  try {
    const payload: UpdateMePayload = {
      name: form.name,
      phone: form.phone,
      secret_code: form.secret || undefined,

      bank_number: form.bankAccount?.bankNumber ?? "",
      branch_number: form.bankAccount?.branchNumber ?? "",
      account_number: form.bankAccount?.accountNumber ?? "",
      account_holder: form.bankAccount?.accountHolder ?? "",

      additional_phones: (form.additionalPhones ?? [])
        .map((p) => p.trim())
        .filter(Boolean),
    };

    const res: UserMeApiResponse = await meApi.updateMe(payload);

    if (!res.success) {
      return rejectWithValue(res.message || "שגיאה בעדכון פרטים");
    }

    return {
      ...res.user,
      additionalPhones:
        res.user.additionalPhones ?? (res.user as any).additional_phones ?? [],
    };
  } catch (e: any) {
    return rejectWithValue(extractMsg(e, "שגיאה בעדכון פרטים"));
  }
});

export const registerUser = createAsyncThunk<
  UserMe,
  UserFormData,
  { rejectValue: RejectValue }
>("auth/registerUser", async (form, { rejectWithValue }) => {
  try {
    const payload: RegisterPayload = {
      phone_number: form.phone,
      secret_code: form.secret ?? "",
      name: form.name,
      bank_number: form.bankAccount?.bankNumber ?? "",
      branch_number: form.bankAccount?.branchNumber ?? "",
      account_number: form.bankAccount?.accountNumber ?? "",
      additional_phones: (form.additionalPhones ?? [])
        .map((p) => p.trim())
        .filter(Boolean),

      card_number: (form.creditCard?.cardNumber ?? "").replace(/\s/g, ""),
      card_expiry: form.creditCard?.expiry ?? "",
      card_cvv: form.creditCard?.cvv ?? "",
      national_id: form.creditCard?.nationalId ?? "",
    };

    const res = await authApi.registerUser(payload);
    if (!res?.success) return rejectWithValue(res?.message || "שגיאה בהרשמה");

    const loginRes = await authApi.loginUser(
      payload.phone_number,
      payload.secret_code,
    );
    if (!loginRes?.success)
      return rejectWithValue(loginRes?.message || "נרשמת אך ההתחברות נכשלה");

    localStorage.setItem("accessToken", loginRes.access_token);
    localStorage.setItem("refreshToken", loginRes.refresh_token);

    const me: UserMeApiResponse = await meApi.getMe();
    if (!me.success)
      return rejectWithValue(me.message || "נרשמת אך טעינת פרופיל נכשלה");

    console.log("ME RESPONSE:", me);

    return me.user;
  } catch (e: any) {
    return rejectWithValue(extractMsg(e, "שגיאה בהרשמה"));
  }
});
