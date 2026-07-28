import { useState } from "react";

import { Alert, Snackbar } from "@mui/material";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import UserForm from "../../components/forms/UserForm";
import { setUser } from "../../features/auth/authSlice";
import { updateUser } from "../../features/auth/authThunks";
import { radius } from "../../theme/designTokens";

import type { UserFormData } from "../../types";

export default function ProfilePage() {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector(s => s.auth);
    const [readOnly, setRO] = useState(true);
    const [saved, setSaved] = useState(false);

    if (!user) return null;

    const save = async (data: UserFormData) => {
        const r = await dispatch(updateUser(data)).unwrap();
        dispatch(setUser(r));
        setRO(true);
        setSaved(true);
    };

    return (
        <>
            <UserForm
                initialData={user}
                readOnly={readOnly}
                loading={loading}
                onEdit={() => setRO(false)}
                onCancel={() => setRO(true)}
                onSave={save}
            />

            <Snackbar
                open={saved}
                autoHideDuration={4000}
                onClose={() => setSaved(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setSaved(false)}
                    sx={{ borderRadius: radius.button, fontWeight: 500 }}
                >
                    הפרטים נשמרו בהצלחה
                </Alert>
            </Snackbar>
        </>
    );
}
