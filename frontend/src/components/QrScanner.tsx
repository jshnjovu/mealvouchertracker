import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Alert, 
  Box, 
  Button, 
  CircularProgress, 
  Fade, 
  Stack, 
  Typography,
  Zoom
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import QrCodeIcon from "@mui/icons-material/QrCode";

type Props = {
  onScan: (decodedText: string) => void;
};

export default function QrScanner({ onScan }: Props) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const regionId = useRef(`qr-region-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(regionId.current);
    return () => {
      if (isRunningRef.current && scannerRef.current) {
        scannerRef.current.stop().catch(() => undefined);
      }
      scannerRef.current?.clear();
    };
  }, []);

  const start = async () => {
    if (!scannerRef.current || isRunningRef.current) return;
    setError(null);
    setLoading(true);
    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        { 
          fps: 20, // Increased from 10 for better detection
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            // Make qrbox responsive - use 80% of the smaller dimension
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.8);
            return {
              width: qrboxSize,
              height: qrboxSize
            };
          },
          aspectRatio: 1.0,
          supportedScanTypes: [], // Support all formats
          verbose: true // Enable verbose logging for debugging
        },
        (decodedText) => {
          // Success callback
          console.log("QR Code detected:", decodedText);
          onScan(decodedText);
          stop().catch(() => undefined);
        },
        (errorMessage) => {
          // Error callback - log but don't show error for normal scanning attempts
          // Only log if it's not a normal "not found" message
          if (!errorMessage.includes("No QR code found")) {
            console.debug("QR scan attempt:", errorMessage);
          }
        }
      );
      isRunningRef.current = true;
      setActive(true);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("QR Scanner error:", errorMessage);
      
      // Provide more specific error messages
      if (errorMessage.includes("Permission") || errorMessage.includes("NotAllowedError")) {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else if (errorMessage.includes("NotFoundError") || errorMessage.includes("DevicesNotFoundError")) {
        setError("No camera found. Please ensure a camera is connected and try again.");
      } else if (errorMessage.includes("NotReadableError") || errorMessage.includes("TrackStartError")) {
        setError("Camera is already in use by another application. Please close other apps using the camera.");
      } else {
        setError(`Camera access failed: ${errorMessage}. Please check your camera permissions.`);
      }
      setLoading(false);
      setActive(false);
    }
  };

  const stop = async () => {
    if (!scannerRef.current || !isRunningRef.current) return;
    try {
      await scannerRef.current.stop();
    } finally {
      isRunningRef.current = false;
      setActive(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          position: "relative",
          height: 300,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "grey.900",
          border: "2px solid",
          borderColor: active ? "primary.main" : "grey.800",
          boxShadow: active ? 4 : 2,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "& video": { 
            width: "100%", 
            height: "100%", 
            objectFit: "cover" 
          },
          "& canvas": { 
            width: "100%", 
            height: "100%" 
          }
        }}
      >
        <Box
          id={regionId.current}
          sx={{
            width: "100%",
            height: "100%",
            position: "relative"
          }}
        />
        {!active && !loading && (
          <Fade in>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                gap: 2
              }}
            >
              <QrCodeIcon sx={{ fontSize: 64, opacity: 0.5 }} />
              <Typography variant="body1" fontWeight={500}>
                Camera Ready
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Click Start Camera to begin scanning
              </Typography>
            </Box>
          </Fade>
        )}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.7)",
              color: "white"
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={48} sx={{ color: "white" }} />
              <Typography variant="body2" fontWeight={500}>
                Starting camera...
              </Typography>
            </Stack>
          </Box>
        )}
        {active && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 250,
              height: 250,
              border: "2px dashed",
              borderColor: "primary.main",
              borderRadius: 2,
              pointerEvents: "none",
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)"
            }}
          />
        )}
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button
          variant={active ? "outlined" : "contained"}
          color={active ? "error" : "primary"}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : active ? (
              <StopCircleIcon />
            ) : (
              <CameraAltIcon />
            )
          }
          onClick={active ? stop : start}
          disabled={loading}
          fullWidth
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600
          }}
        >
          {loading ? "Starting..." : active ? "Stop Camera" : "Start Camera"}
        </Button>
      </Stack>
      {error && (
        <Zoom in timeout={300}>
          <Alert 
            severity="warning"
            sx={{
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: 24
              }
            }}
          >
            {error}
          </Alert>
        </Zoom>
      )}
    </Stack>
  );
}
