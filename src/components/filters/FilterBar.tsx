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
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";

import { colors, focusRing, radius, shadows } from "../../theme/designTokens";

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
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "right", fontWeight: 700 }}>
          בחר טווח תאריכים
        </DialogTitle>
        <DialogContent sx={{ direction: "rtl" }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <DatePicker
              label="תאריך התחלה"
              value={customStartDate}
              onChange={(v) => onCustomDateChange(v, customEndDate)}
            />
            <DatePicker
              label="תאריך סיום"
              value={customEndDate}
              onChange={(v) => onCustomDateChange(customStartDate, v)}
              minDate={customStartDate || undefined}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", p: 3 }}>
          <Button onClick={() => setIsCustomDialogOpen(false)} variant="text" size="large">
            ביטול
          </Button>
          <Button
            onClick={handleApplyCustomFilter}
            color="primary"
            variant="contained"
            size="large"
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
