import React from "react";
import { Flex, Button, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <Flex
      bg="teal.500"
      color="white"
      p={4}
      position="fixed"
      top="0"
      left="0"
      right="0"
      height="60px"
      justify="space-between"
      align="center"
      zIndex={1000}
    >
      {/* Logo */}
      <Image
        src="/winvinaya_foundation_logo.png"
        alt="WinVinaya Logo"
        height="40px"
        objectFit="contain"
        cursor="pointer"
        onClick={() => navigate("/dashboard")} // optional click to go home
      />

      <Button colorScheme="whiteAlpha" onClick={handleLogout}>
        Logout
      </Button>
    </Flex>
  );
};

export default Navbar;
