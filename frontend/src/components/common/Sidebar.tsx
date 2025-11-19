import React from "react";
import { Box, VStack, Link } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const linkStyle = {
    textDecoration: "none",
    padding: "10px 15px",
    borderRadius: "8px",
    fontWeight: "500",
    _hover: { bg: "gray.100", color: "teal.700" },
    _activeLink: { bg: "teal.500", color: "white" },
  };

  return (
    <Box
      bg="white"
      color="teal.700"
      width="250px"
      position="fixed"
      top="64px"
      left="0"
      bottom="0"
      p={4}
      overflowY="auto"
    >
<VStack align="stretch" spacing={2}>
  <Link as={NavLink} to="/dashboard" {...linkStyle}>Home</Link>
  <Link as={NavLink} to="/dashboard/attendance" {...linkStyle}>Attendance</Link>
  <Link as={NavLink} to="/dashboard/business" {...linkStyle}>Business</Link>
  <Link as={NavLink} to="/registration" >Candidate Registration</Link>
</VStack>

    </Box>
  );
};

export default Sidebar;
