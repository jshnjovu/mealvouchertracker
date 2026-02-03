import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f2c2b",
      light: "#1a4a47",
      dark: "#081a19",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#f07b6a",
      light: "#f59a8d",
      dark: "#d85a47",
      contrastText: "#ffffff"
    },
    success: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20"
    },
    warning: {
      main: "#ed6c02",
      light: "#ff9800",
      dark: "#e65100"
    },
    error: {
      main: "#d32f2f",
      light: "#ef5350",
      dark: "#c62828"
    },
    info: {
      main: "#0288d1",
      light: "#03a9f4",
      dark: "#01579b"
    },
    background: {
      default: "#f4f0e8",
      paper: "#ffffff"
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.6)"
    }
  },
  typography: {
    fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
    h1: {
      fontFamily: '"DM Serif Display", serif',
      fontWeight: 400,
      letterSpacing: "-0.02em"
    },
    h2: {
      fontFamily: '"DM Serif Display", serif',
      fontWeight: 400,
      letterSpacing: "-0.02em"
    },
    h3: {
      fontFamily: '"DM Serif Display", serif',
      fontWeight: 400,
      letterSpacing: "-0.01em"
    },
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.01em"
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em"
    }
  },
  shape: {
    borderRadius: 18
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.1)",
    "0px 4px 8px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.1)",
    "0px 6px 12px rgba(0,0,0,0.1), 0px 3px 6px rgba(0,0,0,0.12)",
    "0px 8px 16px rgba(0,0,0,0.12), 0px 4px 8px rgba(0,0,0,0.14)",
    "0px 10px 20px rgba(0,0,0,0.14), 0px 5px 10px rgba(0,0,0,0.16)",
    "0px 12px 24px rgba(0,0,0,0.16), 0px 6px 12px rgba(0,0,0,0.18)",
    "0px 14px 28px rgba(0,0,0,0.18), 0px 7px 14px rgba(0,0,0,0.2)",
    "0px 16px 32px rgba(0,0,0,0.2), 0px 8px 16px rgba(0,0,0,0.22)",
    "0px 18px 36px rgba(0,0,0,0.22), 0px 9px 18px rgba(0,0,0,0.24)",
    "0px 20px 40px rgba(0,0,0,0.24), 0px 10px 20px rgba(0,0,0,0.26)",
    "0px 22px 44px rgba(0,0,0,0.26), 0px 11px 22px rgba(0,0,0,0.28)",
    "0px 24px 48px rgba(0,0,0,0.28), 0px 12px 24px rgba(0,0,0,0.3)",
    "0px 26px 52px rgba(0,0,0,0.3), 0px 13px 26px rgba(0,0,0,0.32)",
    "0px 28px 56px rgba(0,0,0,0.32), 0px 14px 28px rgba(0,0,0,0.34)",
    "0px 30px 60px rgba(0,0,0,0.34), 0px 15px 30px rgba(0,0,0,0.36)",
    "0px 32px 64px rgba(0,0,0,0.36), 0px 16px 32px rgba(0,0,0,0.38)",
    "0px 34px 68px rgba(0,0,0,0.38), 0px 17px 34px rgba(0,0,0,0.4)",
    "0px 36px 72px rgba(0,0,0,0.4), 0px 18px 36px rgba(0,0,0,0.42)",
    "0px 38px 76px rgba(0,0,0,0.42), 0px 19px 38px rgba(0,0,0,0.44)",
    "0px 40px 80px rgba(0,0,0,0.44), 0px 20px 40px rgba(0,0,0,0.46)",
    "0px 42px 84px rgba(0,0,0,0.46), 0px 21px 42px rgba(0,0,0,0.48)",
    "0px 44px 88px rgba(0,0,0,0.48), 0px 22px 44px rgba(0,0,0,0.5)",
    "0px 46px 92px rgba(0,0,0,0.5), 0px 23px 46px rgba(0,0,0,0.52)"
  ],
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    },
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 999,
          padding: "10px 24px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 4
          }
        },
        contained: {
          boxShadow: 2,
          "&:hover": {
            boxShadow: 4
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: 4
          }
        },
        elevation1: {
          boxShadow: "0px 2px 4px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.1)"
        },
        elevation2: {
          boxShadow: "0px 4px 8px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.1)"
        },
        elevation3: {
          boxShadow: "0px 6px 12px rgba(0,0,0,0.1), 0px 3px 6px rgba(0,0,0,0.12)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 12
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: 1
            },
            "&.Mui-focused": {
              boxShadow: 2
            }
          }
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&.Mui-selected": {
            boxShadow: 2
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid rgba(0, 0, 0, 0.08)"
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 4,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateX(4px)"
          }
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            transform: "scale(1.01)"
          }
        }
      }
    },
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: 6,
          "& .MuiPickersCalendarHeader-root": {
            marginTop: 8
          },
          "& .MuiPickersDay-root": {
            borderRadius: 12,
            fontWeight: 500,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: "primary.light",
              color: "white"
            },
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "primary.dark"
              }
            }
          },
          "& .MuiPickersCalendarHeader-label": {
            fontWeight: 600,
            fontSize: "1rem"
          }
        }
      }
    }
  }
});

export default theme;
