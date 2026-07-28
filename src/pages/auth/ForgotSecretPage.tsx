import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  resetForgotSecret,
  startForgotSecret,
  verifyForgotSecret,
} from "../../api/forgotSecretApi";

type Step = "phone" | "verify" | "reset" | "success";

export default function ForgotSecretPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  const handleStart = async () => {
    clearMessages();

    if (!phoneNumber.trim()) {
      setError("יש להזין מספר טלפון");
      return;
    }

    try {
      setLoading(true);
      const res = await startForgotSecret(phoneNumber);

      if (!res?.challenge_id) {
        setError(res?.message || "לא הצלחנו להתחיל שחזור קוד");
        return;
      }

      setChallengeId(res.challenge_id);
      setMessage(
        "נשלחה שיחת אימות. הקישי את 4 הספרות האחרונות של המספר שהתקשר אלייך.",
      );
      setStep("verify");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail?.message ||
          err?.response?.data?.message ||
          "שגיאה בשליחת שיחת האימות",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    clearMessages();

    if (code.trim().length !== 4) {
      setError("יש להזין 4 ספרות");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyForgotSecret(challengeId, code);

      if (!res?.success) {
        setError(res?.message || "קוד האימות שגוי");
        return;
      }

      setStep("reset");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail?.message ||
          err?.response?.data?.message ||
          "שגיאה באימות הקוד",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    clearMessages();

    if (newSecret.trim().length !== 6) {
      setError("הקוד החדש חייב להכיל 6 ספרות");
      return;
    }

    try {
      setLoading(true);
      const res = await resetForgotSecret(challengeId, newSecret);

      if (!res?.success) {
        setError(res?.message || "לא הצלחנו לעדכן את הקוד");
        return;
      }

      setStep("success");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail?.message ||
          err?.response?.data?.message ||
          "שגיאה בעדכון הקוד",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      py={6}
      sx={{ bgcolor: "background.default", direction: "rtl" }}
    >
      <Paper sx={{ p: 5, width: "100%", maxWidth: 500, borderRadius: 3 }}>
        <Typography variant="h4" textAlign="center" mb={3}>
          שחזור קוד סודי
        </Typography>

        <Stack spacing={3}>
          {message && <Alert severity="info">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {step === "phone" && (
            <>
              <Typography textAlign="center">
                הזיני את מספר הטלפון שלך ונשלח אלייך שיחת אימות.
              </Typography>

              <TextField
                label="מספר טלפון"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                autoComplete="tel-national"
              />

              <Button
                variant="contained"
                onClick={handleStart}
                disabled={loading}
              >
                שלח שיחת אימות
              </Button>
            </>
          )}

          {step === "verify" && (
            <>
              <Typography textAlign="center">
                הקישי את 4 הספרות האחרונות של המספר שהתקשר אלייך.
              </Typography>

              <TextField
                label="4 ספרות אחרונות"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                inputProps={{ maxLength: 4 }}
              />

              <Button
                variant="contained"
                onClick={handleVerify}
                disabled={loading}
              >
                אמת קוד
              </Button>
            </>
          )}

          {step === "reset" && (
            <>
              <Typography textAlign="center">בחרי קוד סודי חדש.</Typography>

              <TextField
                label="קוד סודי חדש"
                type="password"
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                fullWidth
                inputProps={{ maxLength: 6 }}
                autoComplete="new-password"
              />

              <Button
                variant="contained"
                onClick={handleReset}
                disabled={loading}
              >
                עדכן קוד
              </Button>
            </>
          )}

          {step === "success" && (
            <>
              <Alert severity="success">הקוד עודכן בהצלחה.</Alert>

              <Button variant="contained" onClick={() => navigate("/login")}>
                חזרה להתחברות
              </Button>
            </>
          )}

          {step !== "success" && (
            <Button variant="text" onClick={() => navigate("/login")}>
              חזרה להתחברות
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
