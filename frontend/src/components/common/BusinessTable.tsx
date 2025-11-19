import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Spinner,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  IconButton,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import { getAllBusiness, createBusiness, updateBusiness } from "../../helpers/business.service";
import { getAllCandidates } from "../../helpers/registration.service";
import { BusinessModel } from "../../helpers/business.model";

interface CandidateOption {
  id: string;
  name: string;
  business_type?: string[]; // <-- new field
}


const BusinessTable = () => {
  // Table state
  const [businessData, setBusinessData] = useState<BusinessModel[]>([]);
  const [filteredData, setFilteredData] = useState<BusinessModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const tableHeadBg = useColorModeValue("gray.50", "gray.700");

  // Filters
  const [filterCandidate, setFilterCandidate] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [candidateList, setCandidateList] = useState<CandidateOption[]>([]);
  const [editingRecord, setEditingRecord] = useState<BusinessModel | null>(null); // Track editing

  // Form state
  const [formData, setFormData] = useState<BusinessModel>({
    candidate_id: "",
    customers_before: 0,
    customers_after: 0,
    income_before: 0,
    income_after: 0,
  });

  // Fetch business data
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAllBusiness();
      setBusinessData(result);
      setFilteredData(result);
    } catch (err) {
      console.error("Error fetching business data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const candidates = await getAllCandidates();
      const mapped = candidates.map((c) => ({
        id: c.id ?? "",
        name: c.name ?? "Unnamed",
		business_type: c.business_type ?? "-", // <-- add business type
      }));
      setCandidateList(mapped);
    } catch (err) {
      console.error("Error fetching candidates:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCandidates();
  }, []);

  // Filter effect
  useEffect(() => {
    let data = businessData;
    if (filterCandidate) {
      data = data.filter((b) => b.candidate_id === filterCandidate);
    }
    setFilteredData(data);
    setCurrentPage(1);
  }, [filterCandidate, businessData]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear filters
  const clearFilters = () => {
    setFilterCandidate("");
    setFilteredData(businessData);
  };

  // Open modal for adding
  const addBusiness = () => {
    setEditingRecord(null);
    setFormData({
      candidate_id: "",
      customers_before: 0,
      customers_after: 0,
      income_before: 0,
      income_after: 0,
    });
    onOpen();
  };

  // Open modal for editing
  const editBusiness = (record: BusinessModel) => {
    setEditingRecord(record);
    setFormData({
      ...record,
      customers_before: record.customers_before ?? 0,
      customers_after: record.customers_after ?? 0,
      income_before: record.income_before ?? 0,
      income_after: record.income_after ?? 0,
    });
    onOpen();
  };

  // Submit form (Add or Edit)
  const handleSubmit = async () => {
    try {
      if (!formData.candidate_id) {
        alert("Candidate is required!");
        return;
      }

      if (editingRecord) {
        // Update existing
        await updateBusiness(editingRecord.id!, formData);
        alert("Business record updated successfully");
      } else {
        // Create new
        await createBusiness(formData);
        alert("Business record added successfully");
      }

      onClose();
      fetchData();
    } catch (err) {
      console.error("Error saving business:", err);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box p={5} borderWidth={1} borderRadius="xl">
      {/* Filters + Add Button */}
      <Flex mb={4} justify="space-between" align="center">
        <Flex gap={4}>
          <Select
            placeholder="Filter by candidate"
            value={filterCandidate}
            onChange={(e) => setFilterCandidate(e.target.value)}
          >
            {candidateList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button onClick={clearFilters} colorScheme="gray" variant="outline">
            Clear
          </Button>
        </Flex>

        <Button colorScheme="blue" onClick={addBusiness}>
          Add Business Details
        </Button>
      </Flex>

      {/* Table */}
      <Table variant="simple" colorScheme="gray">
        <Thead bg={tableHeadBg}>
          <Tr>
            <Th>Candidate</Th>
			<Th>Business Type</Th>
            <Th>Total Customers Before</Th>
            <Th>Total Customers After</Th>
            <Th>Income Before</Th>
            <Th>Income After</Th>
            <Th>Date</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedData.map((b) => {
            const candidate = candidateList.find((c) => c.id === b.candidate_id);
            const dateOnly = b.created_at ? new Date(b.created_at).toISOString().split("T")[0] : "-";

            return (
              <Tr key={b.id}>
                <Td>{candidate ? candidate.name : "-"}</Td>
				<Td>{candidate?.business_type?.length ? candidate.business_type.join(", ") : "-"}</Td>
                <Td>{b.customers_before ?? 0}</Td>
                <Td>{b.customers_after ?? 0}</Td>
                <Td>
                  {b.income_before != null
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(b.income_before)
                    : "₹0"}
                </Td>
                <Td>
                  {b.income_after != null
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(b.income_after)
                    : "₹0"}
                </Td>
                <Td>{dateOnly}</Td>
                <Td>
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => editBusiness(b)}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {/* Pagination */}
      <Flex mt={4} justify="space-between" align="center">
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <Flex gap={2}>
          <Button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            size="sm"
          >
            Prev
          </Button>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            size="sm"
          >
            Next
          </Button>
        </Flex>
      </Flex>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingRecord ? "Edit Business Details" : "Add Business Details"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mt={3}>
              <FormLabel>Candidate</FormLabel>
              <Select
                placeholder="Select candidate"
                value={formData.candidate_id}
                onChange={(e) => setFormData({ ...formData, candidate_id: e.target.value })}
              >
                {candidateList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Total Customers Before</FormLabel>
              <Input
                type="number"
                value={formData.customers_before ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, customers_before: Number(e.target.value) })
                }
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Total Customers After</FormLabel>
              <Input
                type="number"
                value={formData.customers_after ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, customers_after: Number(e.target.value) })
                }
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Income Before</FormLabel>
              <Input
                type="number"
                value={formData.income_before ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, income_before: Number(e.target.value) })
                }
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Income After</FormLabel>
              <Input
                type="number"
                value={formData.income_after ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, income_after: Number(e.target.value) })
                }
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BusinessTable;
