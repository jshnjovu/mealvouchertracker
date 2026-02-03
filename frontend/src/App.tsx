import { useState } from "react";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import HistoryIcon from "@mui/icons-material/History";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ScanPage from "./pages/ScanPage";
import HistoryPage from "./pages/HistoryPage";
import AdminPage from "./pages/AdminPage";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useEmployeeCache } from "./hooks/useEmployeeCache";
import { useVoucherSync } from "./hooks/useVoucherSync";

const drawerWidth = 240;

const navItems = [
  { to: "/", label: "Scan", icon: <QrCodeScannerIcon /> },
  { to: "/history", label: "History", icon: <HistoryIcon /> },
  { to: "/admin", label: "Admin", icon: <AdminPanelSettingsIcon /> }
];

export default function App() {
  const location = useLocation();
  const online = useOnlineStatus();
  useEmployeeCache();
  useVoucherSync();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{ px: 2, py: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Meal Voucher
      </Typography>
      <List>
        {navItems.map((item) => {
          const isActive =
            item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === "/"}
            selected={isActive}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected, &.Mui-selected:hover": {
                bgcolor: "primary.main",
                color: "common.white",
                "& .MuiListItemIcon-root": { color: "common.white" }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        )})}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ 
              mr: 2, 
              display: { sm: "none" },
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)"
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: "\"DM Serif Display\", serif",
                fontWeight: 400,
                letterSpacing: "-0.02em"
              }}
            >
              Voucher Flow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track check-ins, check-outs, and offline syncs.
            </Typography>
          </Box>
          <Chip
            icon={online ? <CloudDoneIcon /> : <CloudOffIcon />}
            label={online ? "Online" : "Offline"}
            color={online ? "success" : "warning"}
            variant="outlined"
            sx={{
              fontWeight: 500,
              transition: "all 0.3s",
              "&:hover": {
                transform: "scale(1.05)"
              }
            }}
          />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { 
              boxSizing: "border-box", 
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider"
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { 
              boxSizing: "border-box", 
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider"
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "transparent",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<ScanPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Box>
    </Box>
  );
}
