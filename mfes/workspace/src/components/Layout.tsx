import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import Sidebar from "./SideBar";
import { Toaster, toast } from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import PersonalVideoIcon from "@mui/icons-material/PersonalVideo";

interface LayoutProps {
  children: React.ReactNode;
  selectedKey: string;
  onSelect: (key: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, selectedKey, onSelect }) => {
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    // Check localStorage to see if the toast has been dismissed
    const isToastDismissed =
      localStorage.getItem("desktopToastDismissed") === "true";

    const handleResize = () => {
      if (
        window.innerWidth < 768 &&
        !isToastDismissed &&
        !toastShown &&
        !toastShown
      ) {
        toast(
          (t: any) => (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "flex-start", gap: "15px" }}
              >
                <PersonalVideoIcon sx={{ color: "#FFFFFF" }} />
                <Box
                  sx={{
                    fontSize: "14px",
                    color: "#F4F4F4",
                    fontWeight: "500",
                  }}
                >
                  Switch to desktop for a better experience
                </Box>
              </Box>
              <Button
                onClick={() => {
                  toast.dismiss(t.id);
                  localStorage.setItem("desktopToastDismissed", "true"); // Store dismissal in localStorage
                  setToastShown(true);
                }}
                style={{
                  marginLeft: "10px",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <CloseIcon />
              </Button>
            </Box>
          ),
          {
            position: "top-center",
            duration: Infinity,
            style: {
              background: "green",
              color: "#fff",
            },
          }
        );
        setToastShown(true); // Mark toast as shown
      }
    };

    // Check on initial load
    if (!localStorage.getItem("isToastCalled")) {
      handleResize();
      localStorage.setItem("isToastCalled", "true");
    }

    // Attach event listener for window resize
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [toastShown]);

  return (
    <Box
      display="flex"
      sx={{ overflowX: "hidden !important" }}
      minHeight="90vh"
    >
      <Toaster />
      <Box
        sx={{
          maxHeight: "132vh",
          minHeight: "100vh",
          "@media (max-width: 900px)": {
            position: "fixed",
            top: "3px",
            zIndex: "99999",
          },
          "@media (min-width: 900px)": {
            background: "linear-gradient(to bottom, white, #F8EFDA)",
            position: "fixed",
            borderRight : '1px solid #ddd',
          },
        }}
      >
        <Sidebar selectedKey={selectedKey} onSelect={onSelect} />
      </Box>
      <Box
        sx={{
          flex: 1,
          // background: "#F3F5F8",
          "@media (min-width: 900px)": {
            width: "calc(100% - 251px)",
            marginLeft: "284px",
          },
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
