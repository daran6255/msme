import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
} from "@chakra-ui/react";
import useCustomToast from "../hooks/useCustomToast";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useCustomToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Hardcoded authentication
    const validEmail = "info@winvinaya.com";
    const validPassword = "12345";

    try {
      if (formData.email === validEmail && formData.password === validPassword) {
        showToast("Login Successful", "You have successfully logged in.", "success");
        navigate("/dashboard");
      } else {
        showToast("Login Failed", "Invalid email or password.", "error");
      }
    } catch {
      showToast("Login Failed", "Unexpected error occurred.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading as="h1" size="lg" mb={6} textAlign="center">
        Log In to Your Account
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full" isLoading={isLoading}>
            Log In
          </Button>
        </VStack>
      </form>
      <Text mt={4} textAlign="center">
        Don't have an account?{" "}
        <a href="/signup" style={{ color: "teal" }}>
          Sign up
        </a>
      </Text>
    </Box>
  );
};

export default Login;
