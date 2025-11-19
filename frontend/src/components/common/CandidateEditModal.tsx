import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { CandidateRegistration, Gender, PhoneType, CandidateStatus } from "../../helpers/registration.model";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRegistration | null;
  setCandidate: (c: CandidateRegistration) => void;
  onUpdate: () => void;
}

const CandidateEditModal: React.FC<Props> = ({ isOpen, onClose, candidate, setCandidate, onUpdate }) => {
  if (!candidate) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Candidate</ModalHeader>
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              value={candidate.name}
              onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Contact</FormLabel>
            <Input
              value={candidate.contact}
              onChange={(e) => setCandidate({ ...candidate, contact: e.target.value })}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Gender</FormLabel>
            <Select
              value={candidate.gender}
              onChange={(e) => setCandidate({ ...candidate, gender: e.target.value as Gender })}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Business Type</FormLabel>
            <Input
              value={candidate.business_type.join(", ")}
              onChange={(e) => setCandidate({
                ...candidate,
                business_type: e.target.value.split(",").map((v) => v.trim()),
              })}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Pin Code</FormLabel>
            <Input
              value={candidate.pin_code}
              onChange={(e) => setCandidate({ ...candidate, pin_code: e.target.value })}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Status</FormLabel>
            <Select
              value={candidate.status ?? ""}
              onChange={(e) => setCandidate({ ...candidate, status: e.target.value as CandidateStatus })}
            >
              <option value="">Select</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>Phone Type</FormLabel>
            <Select
              value={candidate.phone_type}
              onChange={(e) => setCandidate({ ...candidate, phone_type: e.target.value as PhoneType })}
            >
              <option value="">Select</option>
              <option value="Smart Phone">Smart Phone</option>
              <option value="Basic Phone">Basic Phone</option>
            </Select>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onUpdate}>
            Update
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CandidateEditModal;
