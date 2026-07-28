import { useState } from "react";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import * as banksApi from "../../api/banksApi";
import { useUserForm } from "../../hooks/useUserForm";
import {
  cardSx,
  colors,
  pageBackground,
  radius,
  shadows,
} from "../../theme/designTokens";
import FormFields from "../forms/FormFields";

interface Props {
  mode: "login" | "register";
  loading?: boolean;
  error?: string;
  onSubmit: (data: any) => Promise<void> | void;
  onSwitch: () => void;
}

export default function AuthForm({
  mode,
  loading = false,
  error,
  onSubmit,
  onSwitch,
}: Props) {
  const isReg = mode === "register";
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    data,
    errors,
    onChange,
    validate,
    addAdditionalPhone,
    removeAdditionalPhone,
    changeAdditionalPhone,
  } = useUserForm(undefined, isReg ? "register" : "login");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLocalError(null);

    if (!validate()) return;

    if (isReg) {
      try {
        const res = await banksApi.validateBankBranch(
          data.bankAccount.bankNumber,
          data.bankAccount.branchNumber,
        );

        if (!res?.valid) {
          setLocalError(res?.message || "בנק או סניף לא תקינים");
          return;
        }
      } catch (err: any) {
        setLocalError(
          err?.response?.data?.detail?.message ||
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "בנק או סניף לא תקינים",
        );
        return;
      }
    }

    await onSubmit(data);
  };

  const shownError = localError || error;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: pageBackground,
        direction: "rtl",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: isReg ? 640 : 460 }}>
        <Stack alignItems="center" spacing={1.5} mb={4}>
          <Box
            component="img"
            src="/logo.jpg"
            alt="Kosher Pay — Financial Management"
            sx={{
              width: { xs: 200, sm: 240 },
              maxWidth: "100%",
              borderRadius: radius.card,
              boxShadow: shadows.md,
              border: `1px solid ${colors.border}`,
            }}
          />
          <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
            Kosher Pay · פלטפורמה פיננסית מאובטחת לניהול החשבון שלך
          </Typography>
        </Stack>

        <Paper elevation={0} sx={{ ...cardSx, boxShadow: shadows.lg, p: { xs: 3, sm: 5 } }}>
          <Stack spacing={1} mb={4}>
            <Typography
              component="h1"
              sx={{
                fontSize: 32,
                fontWeight: 700,
                color: colors.textPrimary,
                lineHeight: 1.25,
              }}
            >
              {isReg ? "פתיחת חשבון" : "התחברות"}
            </Typography>
            <Typography
              sx={{ fontSize: 16, color: colors.textSecondary, lineHeight: 1.6 }}
            >
              {isReg
                ? "מלאו את הפרטים הבאים לפתיחת חשבון חדש. התהליך אורך דקות ספורות."
                : "ברוכים השבים. הזינו את הפרטים שלכם כדי להמשיך לחשבון."}
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <FormFields
                data={data}
                errors={errors}
                onChange={onChange}
                showBankFields={isReg}
                showForgotSecret={!isReg}
                onForgotSecretClick={() => navigate("/forgot-secret")}
                onAddAdditionalPhone={addAdditionalPhone}
                onRemoveAdditionalPhone={removeAdditionalPhone}
                onAdditionalPhoneChange={changeAdditionalPhone}
                compact={!isReg}
              />

              {!isReg && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: colors.primary,
                        "&.Mui-checked": { color: colors.primary },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 14, color: colors.textSecondary }}>
                      זכור אותי במכשיר זה
                    </Typography>
                  }
                  sx={{ mx: 0, mt: -1, alignSelf: "flex-start" }}
                />
              )}

              {shownError && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: radius.input,
                    bgcolor: "rgba(220, 38, 38, 0.06)",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    color: colors.dangerText,
                    "& .MuiAlert-icon": { color: colors.dangerText },
                  }}
                >
                  {shownError}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={loading}
                variant="contained"
                size="large"
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : isReg ? (
                  "צור חשבון"
                ) : (
                  "התחבר"
                )}
              </Button>
            </Stack>
          </form>

          <Divider
            sx={{
              my: 4,
              "&::before, &::after": { borderColor: colors.border },
            }}
          >
            <Typography sx={{ fontSize: 14, color: colors.muted, px: 1 }}>
              {isReg ? "כבר יש לך חשבון?" : "עדיין אין לך חשבון?"}
            </Typography>
          </Divider>

          <Button fullWidth onClick={onSwitch} variant="outlined" size="large">
            {isReg ? "מעבר להתחברות" : "מעבר להרשמה"}
          </Button>
        </Paper>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          mt={3}
        >
          <LockOutlinedIcon sx={{ fontSize: 16, color: colors.primary }} />
          <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>
            החיבור מאובטח ומוצפן. לעולם אין למסור את הקוד הסודי לגורם אחר.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
