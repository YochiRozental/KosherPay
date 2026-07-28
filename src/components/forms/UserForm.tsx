import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useUserForm } from "../../hooks/useUserForm";
import {
  cardSx,
  colors,
  headerGradient,
  radius,
  shadows,
} from "../../theme/designTokens";
import FormFields from "../forms/FormFields";

import type { UserMe, UserFormData } from "../../types";

interface Props {
  initialData: UserMe;
  readOnly: boolean;
  loading?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: UserFormData) => void;
}

export default function UserForm({
  initialData,
  readOnly,
  loading,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  const {
    data,
    errors,
    onChange,
    validate,
    addAdditionalPhone,
    removeAdditionalPhone,
    changeAdditionalPhone,
  } = useUserForm(initialData, "profile");

  return (
    <Box
      display="flex"
      justifyContent="center"
      py={{ xs: 3, sm: 5 }}
      px={2}
      sx={{ bgcolor: colors.background, borderRadius: radius.card }}
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 640 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: radius.card,
            background: headerGradient,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.md,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    lineHeight: 1.3,
                  }}
                >
                  {initialData.name}
                </Typography>
                <Typography
                  sx={{ fontSize: 14, color: "rgba(248, 250, 252, 0.72)" }}
                >
                  {initialData.phone}
                </Typography>
              </Box>
            </Stack>

            {readOnly ? (
              <Button
                onClick={onEdit}
                startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: radius.button,
                  textTransform: "none",
                  gap: 1,
                  "& .MuiButton-startIcon": { margin: 0 },
                  fontSize: 15,
                  fontWeight: 600,
                  minHeight: 44,
                  px: 3,
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.32)",
                  transition: "background-color 200ms ease, border-color 200ms ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                    borderColor: "rgba(255, 255, 255, 0.56)",
                  },
                }}
              >
                ערוך פרטים
              </Button>
            ) : (
              <Chip
                label="מצב עריכה"
                size="small"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.14)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ ...cardSx, p: { xs: 3, sm: 5 } }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!validate()) return;
              onSave(data);
            }}
          >
            <FormFields
              data={data}
              errors={errors}
              onChange={onChange}
              readOnly={readOnly}
              showBankFields={true}
              onAddAdditionalPhone={addAdditionalPhone}
              onRemoveAdditionalPhone={removeAdditionalPhone}
              onAdditionalPhoneChange={changeAdditionalPhone}
            />

            {!readOnly && (
              <>
                <Divider sx={{ my: 4, borderColor: colors.border }} />

                <Stack direction="row" spacing={2} justifyContent="space-between">
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    size="large"
                    sx={{ minWidth: 160 }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "שמור"
                    )}
                  </Button>

                  <Button onClick={onCancel} variant="text" size="large">
                    ביטול
                  </Button>
                </Stack>
              </>
            )}
          </form>
        </Paper>
      </Stack>
    </Box>
  );
}
