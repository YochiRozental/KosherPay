import React from "react";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, ButtonBase, useTheme } from "@mui/material";
import { Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { motion } from "framer-motion";


import { colors } from "../../theme/designTokens";

import type { DateFilter } from "../../types";

export type { DateFilter };

interface FilterBarProps {
  filter: DateFilter;
  onFilterChange: (newFilter: DateFilter) => void;
  customStartDate: Dayjs | null;
  customEndDate: Dayjs | null;
  onCustomDateChange: (start: Dayjs | null, end: Dayjs | null) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const theme = useTheme();
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
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderRadius: 4,
          mb: 3,
          background: colors.accentSoft,
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
        }}
      >
        {[
          { key: "all", label: "כל הזמנים" },
          { key: "week", label: "שבוע אחרון" },
          { key: "month", label: "חודש אחרון" },
          { key: "three_months", label: "3 חודשים אחרונים" },
        ].map(({ key, label }) => {
          const isActive = filter === key;
          const borderColor = isActive ? theme.palette.primary.main : theme.palette.divider;

          return (
            <ButtonBase
              key={key}
              onClick={() => onFilterChange(key as DateFilter)}
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              sx={{ borderRadius: "9999px", overflow: "hidden", transition: "0.3s" }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: "9999px",
                  border: `1.5px solid ${borderColor}`,
                  color: isActive ? "white" : theme.palette.primary.main,
                  backgroundColor: isActive ? theme.palette.primary.main : "white",
                  fontWeight: isActive ? "bold" : "normal",
                  transition: "0.3s",
                }}
              >
                {label}
              </Box>
            </ButtonBase>
          );
        })}

        <ButtonBase
          onClick={() => setIsCustomDialogOpen(true)}
          component={motion.div}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          sx={{
            borderRadius: "9999px",
            overflow: "hidden",
            transition: "0.3s",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 1,
              borderRadius: "9999px",
              border: `1.5px solid ${filter === "custom" ? theme.palette.secondary.main : theme.palette.divider
                }`,
              color: filter === "custom" ? "white" : theme.palette.secondary.main,
              backgroundColor: filter === "custom" ? theme.palette.secondary.main : "white",
              fontWeight: filter === "custom" ? "bold" : "normal",
              transition: "0.3s",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 18 }} />
            {formatCustomDateRange()}
          </Box>
        </ButtonBase>
      </Box>

      <Dialog open={isCustomDialogOpen} onClose={() => setIsCustomDialogOpen(false)} fullWidth>
        <DialogTitle sx={{ textAlign: "right" }}>בחר טווח תאריכים</DialogTitle>
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
          <Button onClick={() => setIsCustomDialogOpen(false)} color="error" variant="outlined">
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
