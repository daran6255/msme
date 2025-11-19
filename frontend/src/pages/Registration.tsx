import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Select,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { MultiValue } from "react-select";

import useCustomToast from "../hooks/useCustomToast";
import { createCandidate } from "../helpers/registration.service";
import { CandidateRegistration, Gender, PhoneType } from "../helpers/registration.model";

const Registration: React.FC = () => {
  const [formData, setFormData] = useState<CandidateRegistration>({
    name: "",
    contact: "",
    gender: "" as Gender,
    business_type: [],
    pin_code: "",
    udyam_certificate: false,
    phone_type: "" as PhoneType,
    status: "Active",
  });

  const [isLoading, setIsLoading] = useState(false);
  const showToast = useCustomToast();
  const navigate = useNavigate();

  // Handle normal input & dropdown
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "udyam_certificate" ? value === "true" : value,
    }));
  };

  // Handle creatable multi-select for business_type
  const handleBusinessTypeChange = (
    newValue: MultiValue<{ label: string; value: string }>
  ) => {
    setFormData((prev) => ({
      ...prev,
      business_type: newValue.map((item) => item.value),
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createCandidate(formData);
      showToast("Registration Successful", "Candidate registered successfully!", "success");
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
      showToast("Registration Failed", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading mb={6} textAlign="center">Candidate Registration</Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>

          {/* Name */}
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </FormControl>

          {/* Contact */}
          <FormControl isRequired>
            <FormLabel>Contact</FormLabel>
            <Input name="contact" value={formData.contact} onChange={handleChange} />
          </FormControl>

          {/* Gender */}
          <FormControl isRequired>
            <FormLabel>Gender</FormLabel>
            <Select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormControl>

          {/* Business Type - Creatable Multi Select */}
		<FormControl>
		<FormLabel>Business Type</FormLabel>
		<CreatableSelect
			isMulti
			placeholder="Type and press Enter (e.g., 'roti')"
			onChange={handleBusinessTypeChange}
			value={formData.business_type.map((item) => ({
			label: item,
			value: item,
			}))}
			options={[
			{ label: "Retail", value: "Retail" },
			{ label: "Manufacturing", value: "Manufacturing" },
			{ label: "Service", value: "Service" },
			{ label: "Others", value: "Others" },
			]}
			styles={{
			control: (provided) => ({
				...provided,
				backgroundColor: "white",
				borderColor: "#CBD5E0", // Chakra gray.300
			}),
			input: (provided) => ({
				...provided,
				color: "black", // Ensures typing is visible
			}),
			option: (provided) => ({
				...provided,
				color: "black", // Dropdown option text color
			}),
			multiValueLabel: (provided) => ({
				...provided,
				color: "black", // Selected labels
			}),
			placeholder: (provided) => ({
				...provided,
				color: "#4A5568", // Chakra gray.600
			}),
			}}
		/>
		</FormControl>


          {/* PIN Code */}
          <FormControl isRequired>
            <FormLabel>PIN Code</FormLabel>
            <Input name="pin_code" value={formData.pin_code} onChange={handleChange} />
          </FormControl>

          {/* Udyam Certificate */}
          <FormControl isRequired>
            <FormLabel>Udyam Certificate</FormLabel>
            <Select
              name="udyam_certificate"
              value={String(formData.udyam_certificate)}
              onChange={handleChange}
            >
              <option value="">Select Option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormControl>

          {/* Phone Type */}
          <FormControl isRequired>
            <FormLabel>Phone Type</FormLabel>
            <Select name="phone_type" value={formData.phone_type} onChange={handleChange}>
              <option value="">Select Phone Type</option>
              <option value="Smart Phone">Smart Phone</option>
              <option value="Basic Phone">Basic Phone</option>
            </Select>
          </FormControl>

          {/* Submit */}
          <Button type="submit" colorScheme="teal" width="full" isLoading={isLoading}>
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Registration;
