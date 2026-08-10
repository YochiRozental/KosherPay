import React from "react";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";

import {
  colors,
  focusRing,
  headerGradient,
  radius,
  shadows,
} from "../../theme/designTokens";

import type { DateFilter } from "../../types";

export type { DateFilter };

interface FilterBarProps {
  filter: DateFilter;
  onFilterChange: (newFilter: DateFilter) => void;
  customStartDate: Dayjs | null;
  customEndDate: Dayjs | null;
  onCustomDateChange: (start: Dayjs | null, end: Dayjs | null) => void;
}

const pillSx = (active: boolean) => ({
  borderRadius: "9999px",
  px: 2.5,
  minHeight: 40,
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: active ? 700 : 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  color: active ? "#FFFFFF" : colors.primary,
  bgcolor: active ? colors.primary : colors.surface,
  border: `1.5px solid ${active ? colors.primary : "rgba(23, 60, 108, 0.28)"}`,
  transition:
    "background-color 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
  "&:hover": active
    ? { bgcolor: colors.primaryHover, borderColor: colors.primaryHover }
    : { bgcolor: colors.accentSoft, borderColor: colors.primary },
  "&.Mui-focusVisible": { boxShadow: focusRing },
});

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = React.useState(false);

  const formatCustomDateRange = () => {
    if (filter === "custom" && customStartDate && customEndDate) {
      return `${customStartDate.format("DD/MM/YYYY")} - ${customEndDate.format("DD/MM/YYYY")}`;
    }
    return "בחר טווח תאריכים";
  };

  const handleApplyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      onFilterChange("custom");
      setIsCustomDialogOpen(false);
    }
  };

  return (
    <>
      <Box
        component="section"
        aria-label="סינון תקופת הצגה"
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          bgcolor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.card,
          boxShadow: shadows.sm,
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 1.5 }}>
          <FilterAltOutlinedIcon sx={{ fontSize: 18, color: colors.muted }} />
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: colors.textSecondary,
            }}
          >
            תקופת הצגה
          </Typography>
        </Stack>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
          {[
            { key: "all", label: "כל הזמנים" },
            { key: "week", label: "שבוע אחרון" },
            { key: "month", label: "חודש אחרון" },
            { key: "three_months", label: "3 חודשים אחרונים" },
          ].map(({ key, label }) => {
            const isActive = filter === key;
            return (
              <ButtonBase
                key={key}
                onClick={() => onFilterChange(key as DateFilter)}
                aria-pressed={isActive}
                sx={pillSx(isActive)}
              >
                {label}
              </ButtonBase>
            );
          })}

          <ButtonBase
            onClick={() => setIsCustomDialogOpen(true)}
            aria-pressed={filter === "custom"}
            sx={pillSx(filter === "custom")}
          >
            <CalendarMonthIcon
              sx={{
                fontSize: 18,
                color: filter === "custom" ? colors.gold : "inherit",
              }}
            />
            {formatCustomDateRange()}
          </ButtonBase>
        </Box>
      </Box>

      <Dialog
        open={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        dir="rtl"
        aria-labelledby="custom-range-title"
      >
        <Box
          sx={{
            background: headerGradient,
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: "14px",
              bgcolor: "rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 24, color: colors.gold }} />
          </Box>
          <Box>
            <Typography
              id="custom-range-title"
              component="h2"
              sx={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3 }}
            >
              בחירת טווח תאריכים
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(248, 250, 252, 0.72)" }}>
              הצגת פעילות לתקופה מותאמת אישית
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <DatePicker
              label="תאריך התחלה"
              value={customStartDate}
              onChange={(v) => onCustomDateChange(v, customEndDate)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
            <DatePicker
              label="תאריך סיום"
              value={customEndDate}
              onChange={(v) => onCustomDateChange(customStartDate, v)}
              minDate={customStartDate || undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputLabelProps: { shrink: true },
                },
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: radius.input,
                bgcolor: colors.accentSoft,
                border: `1px solid rgba(23, 60, 108, 0.14)`,
              }}
            >
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary }}
              >
                התקופה שנבחרה
              </Typography>
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  direction: "ltr",
                }}
              >
                {customStartDate && customEndDate
                  ? `${customStartDate.format("DD/MM/YYYY")} - ${customEndDate.format("DD/MM/YYYY")}`
                  : "טרם נבחרו תאריכים"}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setIsCustomDialogOpen(false)}>
            ביטול
          </Button>
          <Button
            onClick={handleApplyCustomFilter}
            color="primary"
            variant="contained"
            disabled={!customStartDate || !customEndDate}
          >
            החל סינון
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FilterBar;
