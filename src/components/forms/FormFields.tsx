import { useState } from "react";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  TextField,
  Stack,
  Typography,
  InputAdornment,
  Button,
  IconButton,
  Box,
} from "@mui/material";

import {
  colors,
  radius,
  textFieldSx,
  ghostButtonSx,
} from "../../theme/designTokens";

interface Props {
  data: Record<string, any> | null;
  errors: Record<string, string> | null;
  onChange: (e: any) => void;

  showForgotSecret?: boolean;
  onForgotSecretClick?: () => void;

  onAddAdditionalPhone?: () => void;
  onRemoveAdditionalPhone?: (index: number) => void;
  onAdditionalPhoneChange?: (index: number, value: string) => void;

  readOnly?: boolean;
  showBankFields?: boolean;
  compact?: boolean;
}

const fieldIconSx = { fontSize: 20, color: colors.primary };

function SectionHeader({
  icon,
  title,
  caption,
}: {
  icon: React.ReactNode;
  title: string;
  caption?: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pt: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: radius.input,
          bgcolor: colors.accentSoft,
          color: colors.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          component="h3"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: colors.textPrimary,
            lineHeight: 1.4,
          }}
        >
          {title}
        </Typography>
        {caption && (
          <Typography
            sx={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}
          >
            {caption}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function FormFields({
  data,
  errors,
  onChange,

  onAddAdditionalPhone,
  onRemoveAdditionalPhone,
  onAdditionalPhoneChange,
  onForgotSecretClick,

  readOnly = false,
  showBankFields = false,
  showForgotSecret = false,
  compact = false,
}: Props) {
  const [showSecret, setShowSecret] = useState(false);

  const bank = data?.bankAccount ?? {
    bankNumber: "",
    branchNumber: "",
    accountNumber: "",
    accountHolder: "",
  };

  const baseProps = (
    name: string,
    label: string,
    icon: any,
    extra: any = {},
    autoComplete?: string,
  ) => ({
    label,
    name,
    value: data?.[name] ?? "",
    onChange,
    fullWidth: true,
    disabled: readOnly,
    error: !!errors?.[name],
    helperText: errors?.[name] || "",
    sx: textFieldSx,
    inputProps: {
      autoComplete: autoComplete || "off",
    },
    InputProps: {
      startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
      readOnly,
    },
    ...extra,
  });

  const rawAdditionalPhones = data?.additionalPhones ?? [];

  const visibleAdditionalPhones = readOnly
    ? rawAdditionalPhones.filter((phone: string) => phone?.trim())
    : rawAdditionalPhones;

  const shouldShowAdditionalPhones =
    visibleAdditionalPhones.length > 0 || (!readOnly && showBankFields);

  return (
    <Stack spacing={2.5}>
      {!compact && (
        <SectionHeader
          icon={<PersonOutlinedIcon fontSize="small" />}
          title="פרטים אישיים"
          caption="פרטי הזיהוי וההתקשרות שלך"
        />
      )}

      <TextField
        {...baseProps("name", "שם מלא", <PersonOutlinedIcon sx={fieldIconSx} />)}
      />
      <TextField
        {...baseProps(
          "phone",
          "טלפון",
          <LocalPhoneOutlinedIcon sx={fieldIconSx} />,
          {},
          "tel-national",
        )}
      />
      <Stack spacing={0.5}>
        <TextField
          {...baseProps(
            "secret",
            "קוד סודי",
            <LockOutlinedIcon sx={fieldIconSx} />,
            {
              type: showSecret ? "text" : "password",
              sx: [
                textFieldSx,
                {
                  "& .MuiOutlinedInput-root.MuiInputBase-adornedEnd": {
                    paddingRight: 0,
                  },
                },
              ],
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={fieldIconSx} />
                  </InputAdornment>
                ),
                endAdornment: !readOnly ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showSecret ? "הסתר קוד סודי" : "הצג קוד סודי"}
                      onClick={() => setShowSecret((s) => !s)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                      sx={{ color: colors.primary }}
                    >
                      {showSecret ? (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
                readOnly,
              },
            },
            "current-password",
          )}
        />

        {showForgotSecret && !readOnly && (
          <Button
            type="button"
            variant="text"
            size="small"
            onClick={onForgotSecretClick}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 500,
              color: colors.accent,
              px: 0.5,
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            שכחתי קוד
          </Button>
        )}
      </Stack>
      {shouldShowAdditionalPhones && (
        <>
          <SectionHeader
            icon={<LocalPhoneOutlinedIcon fontSize="small" />}
            title="טלפונים נוספים"
            caption="מספרים נוספים המשויכים לחשבון"
          />

          {errors?.additionalPhones && (
            <Typography sx={{ color: colors.dangerText, fontSize: 14 }}>
              {errors.additionalPhones}
            </Typography>
          )}

          {visibleAdditionalPhones.map((phone: string, index: number) => (
            <Stack
              key={index}
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <TextField
                label={`טלפון נוסף ${index + 1}`}
                value={phone}
                onChange={(e) =>
                  onAdditionalPhoneChange?.(index, e.target.value)
                }
                disabled={readOnly}
                error={!!errors?.[`additionalPhones.${index}`]}
                helperText={errors?.[`additionalPhones.${index}`] || ""}
                fullWidth
                sx={textFieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalPhoneOutlinedIcon sx={fieldIconSx} />
                    </InputAdornment>
                  ),
                  readOnly,
                }}
              />

              {!readOnly && (
                <IconButton
                  aria-label={`הסר טלפון נוסף ${index + 1}`}
                  onClick={() => onRemoveAdditionalPhone?.(index)}
                  sx={{
                    mt: 1,
                    color: colors.primary,
                    transition: "color 200ms ease, background-color 200ms ease",
                    "&:hover": {
                      color: colors.dangerText,
                      bgcolor: "rgba(239, 68, 68, 0.12)",
                    },
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Stack>
          ))}

          {!readOnly && showBankFields && (
            <Button
              onClick={onAddAdditionalPhone}
              startIcon={<AddRoundedIcon />}
              sx={{
                ...ghostButtonSx,
                minHeight: 44,
                alignSelf: "flex-start",
                border: `1px dashed ${colors.border}`,
                color: colors.primary,
                "&:hover": {
                  bgcolor: colors.accentSoft,
                  borderColor: colors.primaryHover,
                },
              }}
            >
              הוסף טלפון נוסף
            </Button>
          )}
        </>
      )}
      {showBankFields && (
        <>
          <SectionHeader
            icon={<AccountBalanceOutlinedIcon fontSize="small" />}
            title="פרטי חשבון בנק"
            caption="חשבון הבנק המקושר לפעילות בחשבונך"
          />

          <Stack
            direction="row"
            justifyContent={"space-between"}
            spacing={1}
            gap={1}
            width={"100%"}
          >
            <TextField
              label="מספר בנק"
              name="bankNumber"
              value={bank.bankNumber}
              onChange={onChange}
              disabled={readOnly}
              error={!!errors?.bankNumber}
              helperText={errors?.bankNumber}
              fullWidth
              sx={textFieldSx}
              inputProps={{ autoComplete: "off" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceOutlinedIcon sx={fieldIconSx} />
                  </InputAdornment>
                ),
                readOnly,
              }}
            />
            <TextField
              label="מספר סניף"
              name="branchNumber"
              value={bank.branchNumber}
              onChange={onChange}
              disabled={readOnly}
              error={!!errors?.branchNumber}
              helperText={errors?.branchNumber}
              fullWidth
              sx={textFieldSx}
              inputProps={{ autoComplete: "off" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersOutlinedIcon sx={fieldIconSx} />
                  </InputAdornment>
                ),
                readOnly,
              }}
            />
          </Stack>
          <TextField
            label="מספר חשבון"
            name="accountNumber"
            value={bank.accountNumber}
            onChange={onChange}
            disabled={readOnly}
            error={!!errors?.accountNumber}
            helperText={errors?.accountNumber}
            fullWidth
            sx={textFieldSx}
            inputProps={{ autoComplete: "off" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardOutlinedIcon sx={fieldIconSx} />
                </InputAdornment>
              ),
              readOnly,
            }}
          />
          <TextField
            label="שם בעל החשבון"
            name="accountHolder"
            value={bank.accountHolder}
            onChange={onChange}
            disabled={readOnly}
            error={!!errors?.accountHolder}
            helperText={errors?.accountHolder}
            fullWidth
            sx={textFieldSx}
            inputProps={{ autoComplete: "off" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeOutlinedIcon sx={fieldIconSx} />
                </InputAdornment>
              ),
              readOnly,
            }}
          />
        </>
      )}
    </Stack>
  );
}
