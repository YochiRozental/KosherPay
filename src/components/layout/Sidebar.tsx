import { useState, type JSX } from "react";

import {
    Menu as MenuIcon,
    AccountBalanceWallet,
    History,
    Payment,
    Logout,
    SettingsSuggest,
    Send,
    AdminPanelSettings,
    People,
    PersonOutline,
} from "@mui/icons-material";
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";

import {
    colors,
    focusRing,
    radius,
    shadows,
} from "../../theme/designTokens";

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_TABLET = 264;

const drawerWidth = { xs: DRAWER_WIDTH, md: DRAWER_WIDTH_TABLET, lg: DRAWER_WIDTH };

const softDivider = "rgba(23, 60, 108, 0.14)";

type NavItem = {
    key: string;
    label: string;
    icon: JSX.Element;
    path: string;
};

type NavSection = {
    key: string;
    title: string;
    divider?: boolean;
    items: NavItem[];
};

const navItemSx = (active: boolean) => ({
    position: "relative",
    borderRadius: radius.button,
    mb: 0.5,
    px: 1.75,
    minHeight: 48,
    color: active ? colors.primary : colors.textSecondary,
    bgcolor: active ? colors.accentSoft : "transparent",
    transition: "background-color 200ms ease, color 200ms ease, box-shadow 200ms ease",
    "& .MuiListItemIcon-root": {
        minWidth: 40,
        color: active ? colors.primary : colors.muted,
        transition: "color 200ms ease",
    },
    "& .MuiListItemText-primary": {
        fontSize: 14.5,
        fontWeight: active ? 700 : 500,
    },
    "&::before": {
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: "50%",
        width: "3.5px",
        height: 22,
        borderRadius: "8px",
        bgcolor: colors.gold,
        transform: active ? "translateY(-50%) scaleY(1)" : "translateY(-50%) scaleY(0)",
        transition: "transform 200ms ease",
    },
    "&:hover": {
        bgcolor: colors.accentSoft,
        color: colors.primary,
        "& .MuiListItemIcon-root": { color: colors.primary },
    },
    "&.Mui-focusVisible": {
        boxShadow: focusRing,
        bgcolor: colors.accentSoft,
    },
});

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state: any) => state.auth?.user);

    const isAdmin = user?.phone === "0556749022";

    const sections: NavSection[] = [
        {
            key: "account",
            title: "החשבון שלי",
            items: [
                {
                    key: "profile",
                    label: "פרופיל",
                    icon: <PersonOutline />,
                    path: "/profile",
                },
                {
                    key: "actions",
                    label: "פעולות בחשבון",
                    icon: <SettingsSuggest />,
                    path: "/account-actions",
                },
                {
                    key: "balance",
                    label: "יתרה נוכחית",
                    icon: <AccountBalanceWallet />,
                    path: "/balance",
                },
            ],
        },
        {
            key: "payments",
            title: "תשלומים ופעילות",
            items: [
                {
                    key: "history",
                    label: "היסטוריית פעולות",
                    icon: <History />,
                    path: "/history",
                },
                {
                    key: "requests",
                    label: "בקשות תשלום שקיבלתי",
                    icon: <Payment />,
                    path: "/requests",
                },
                {
                    key: "sentRequests",
                    label: "בקשות ששלחתי",
                    icon: <Send />,
                    path: "/sent-requests",
                },
            ],
        },
    ];

    if (isAdmin) {
        sections.push({
            key: "admin",
            title: "אזור ניהול",
            divider: true,
            items: [
                {
                    key: "adminDashboard",
                    label: "ניהול משתמשים",
                    icon: <AdminPanelSettings />,
                    path: "/admin/users",
                },
                {
                    key: "systemLogs",
                    label: "יומן מערכת",
                    icon: <People />,
                    path: "/admin/logs",
                },
            ],
        });
    }

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleNavigate = (path: string) => {
        navigate(path);
        if (isMobile) setMobileOpen(false);
    };

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box
                component={RouterLink}
                to="/"
                aria-label="Kosher Pay — דף הבית"
                sx={{
                    textDecoration: "none",
                    display: "block",
                    outline: "none",
                    "&:focus-visible .brand-header": { boxShadow: focusRing },
                }}
            >
                <Box
                    className="brand-header"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mx: 2,
                        mt: 2.5,
                        mb: 1,
                        px: 1.5,
                        py: 1.5,
                        borderRadius: radius.button,
                        transition: "background-color 200ms ease, box-shadow 200ms ease",
                        "&:hover": { bgcolor: colors.accentSoft },
                    }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "14px",
                            border: `1px solid ${colors.border}`,
                            bgcolor: "#FFFFFF",
                            boxShadow: shadows.sm,
                        }}
                    >
                        <Box
                            component="img"
                            src="/logo.jpg"
                            alt=""
                            sx={{
                                position: "absolute",
                                width: 200,
                                maxWidth: "none",
                                left: -77,
                                top: -18,
                            }}
                        />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: 19,
                                fontWeight: 800,
                                lineHeight: 1.2,
                                color: colors.primary,
                                letterSpacing: "0.01em",
                            }}
                        >
                            Kosher Pay
                        </Typography>
                        <Typography sx={{ fontSize: 11.5, color: colors.textSecondary }}>
                            ניהול פיננסי מאובטח
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ mx: 3, borderColor: softDivider }} />

            <Box
                component="nav"
                aria-label="ניווט ראשי"
                sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 1 }}
            >
                <List disablePadding sx={{ direction: "rtl" }}>
                    {sections.map((section) => (
                        <Box key={section.key}>
                            {section.divider && (
                                <Divider sx={{ mt: 2, mb: 0.5, borderColor: softDivider }} />
                            )}
                            <Typography
                                sx={{
                                    px: 1.75,
                                    pt: 2,
                                    pb: 0.75,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    color: colors.muted,
                                }}
                            >
                                {section.title}
                            </Typography>
                            {section.items.map((item) => {
                                const active = location.pathname === item.path;
                                return (
                                    <ListItemButton
                                        key={item.key}
                                        onClick={() => handleNavigate(item.path)}
                                        aria-current={active ? "page" : undefined}
                                        sx={navItemSx(active)}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                );
                            })}
                        </Box>
                    ))}
                </List>
            </Box>

            <Box sx={{ p: 2, pt: 1 }}>
                <ListItemButton
                    onClick={onLogout}
                    sx={{
                        borderRadius: radius.button,
                        px: 1.75,
                        minHeight: 46,
                        color: colors.dangerText,
                        border: "1px solid rgba(220, 38, 38, 0.25)",
                        transition:
                            "background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
                        "& .MuiListItemIcon-root": { minWidth: 40, color: "inherit" },
                        "& .MuiListItemText-primary": { fontSize: 14.5, fontWeight: 600 },
                        "&:hover": {
                            bgcolor: "rgba(220, 38, 38, 0.06)",
                            borderColor: colors.danger,
                        },
                        "&.Mui-focusVisible": {
                            boxShadow: "0 0 0 4px rgba(220, 38, 38, 0.16)",
                        },
                    }}
                >
                    <ListItemIcon>
                        <Logout />
                    </ListItemIcon>
                    <ListItemText primary="התנתקות" />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <>
            {isMobile && (
                <IconButton
                    aria-label="פתיחת תפריט ניווט"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{
                        position: "fixed",
                        top: 14,
                        left: 14,
                        zIndex: theme.zIndex.drawer + 1,
                        width: 44,
                        height: 44,
                        borderRadius: radius.button,
                        color: colors.primary,
                        bgcolor: colors.surface,
                        border: `1px solid ${colors.border}`,
                        boxShadow: shadows.md,
                        transition: "background-color 200ms ease, box-shadow 200ms ease",
                        "&:hover": { bgcolor: colors.accentSoft },
                        "&.Mui-focusVisible": { boxShadow: focusRing },
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                anchor="right"
                ModalProps={{ keepMounted: true }}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        bgcolor: colors.surface,
                        borderRight: "none",
                        ...(isMobile
                            ? {
                                  borderLeft: "none",
                                  borderTopLeftRadius: radius.card,
                                  borderBottomLeftRadius: radius.card,
                                  boxShadow: shadows.lg,
                              }
                            : {
                                  borderLeft: `1px solid ${colors.border}`,
                                  boxShadow: shadows.md,
                              }),
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}
