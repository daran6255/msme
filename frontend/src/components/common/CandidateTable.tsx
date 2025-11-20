import React, { useEffect, useState, useMemo, ChangeEvent } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  HStack,
  Button,
  Text,
  Spinner,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiEdit } from "react-icons/fi";
import CandidateEditModal from "./CandidateEditModal";
import {
  getAllCandidates,
  getCandidateById,
  updateCandidateById,
} from "../../helpers/registration.service";
import {
  CandidateRegistration,
  Gender,
  CandidateStatus,
} from "../../helpers/registration.model";

const ITEMS_PER_PAGE = 5;

const CandidateTable: React.FC = () => {
  const [data, setData] = useState<CandidateRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRegistration | null>(null);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Pagination
  const [page, setPage] = useState<number>(1);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // UI Theme
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableHeadBg = useColorModeValue("gray.50", "gray.700");

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAllCandidates();
        setData(res);
      } catch {
        toast({ title: "Error fetching candidates", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .filter((item) => (genderFilter ? item.gender === genderFilter : true))
      .filter((item) => (statusFilter ? item.status === statusFilter : true));
  }, [data, search, genderFilter, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => setPage(1), [search, genderFilter, statusFilter]);

  // Edit Modal
  const handleEdit = async (id: string) => {
    try {
      const candidate = await getCandidateById(id);
      setSelectedCandidate(candidate);
      onOpen();
    } catch {
      toast({ title: "Failed to load candidate", status: "error" });
    }
  };

  const handleUpdate = async () => {
    if (!selectedCandidate) return;
    try {
      await updateCandidateById(selectedCandidate.id!, selectedCandidate);
      toast({ title: "Updated successfully", status: "success" });
      onClose();
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  return (
    <Box bg={cardBg} p={6} rounded="lg" shadow="md" border="1px solid" borderColor={borderColor}>
      {/* Filters */}
      <HStack mb={4} spacing={4} align="end">
        <Box>
          <Text fontSize="sm" mb={1}>Search</Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Box>

        <Box>
          <Text fontSize="sm" mb={1}>Gender</Text>
          <Select
            placeholder="All"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as Gender)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
        </Box>

        <Box>
          <Text fontSize="sm" mb={1}>Status</Text>
          <Select
            placeholder="All"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CandidateStatus)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </Box>
      </HStack>

      {/* Table */}
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <Table variant="simple">
          <Thead bg={tableHeadBg}>
            <Tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>Gender</Th>
              <Th>Status</Th>
              <Th>Disabled?</Th>
              <Th>Phone Type</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((item) => (
              <Tr key={item.id}>
                <Td>{item.name}</Td>
                <Td>{item.contact}</Td>
                <Td>
                  <Badge colorScheme={item.gender === "Male" ? "blue" : "pink"}>{item.gender}</Badge>
                </Td>
                <Td>
                  <Badge colorScheme={item.status === "Active" ? "green" : "red"}>
                    {item.status}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={item.disability_cat ? "green" : "gray"}>
                    {item.disability_cat ? "Yes" : "No"}
                  </Badge>
                </Td>
                <Td>{item.phone_type}</Td>
                <Td textAlign="center">
                  <IconButton
                    aria-label="Edit"
                    icon={<FiEdit />}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => handleEdit(item.id!)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Pagination */}
      <HStack justify="space-between" mt={4}>
        <Text fontSize="sm">Page {page} of {totalPages}</Text>
        <HStack>
          <Button
            size="sm"
            leftIcon={<FiChevronLeft />}
            onClick={() => page > 1 && setPage(page - 1)}
            isDisabled={page === 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            rightIcon={<FiChevronRight />}
            onClick={() => page < totalPages && setPage(page + 1)}
            isDisabled={page === totalPages}
          >
            Next
          </Button>
        </HStack>
      </HStack>

      {/* Modal */}
      <CandidateEditModal
        isOpen={isOpen}
        onClose={onClose}
        candidate={selectedCandidate}
        setCandidate={setSelectedCandidate}
        onUpdate={handleUpdate}
      />
    </Box>
  );
};

export default CandidateTable;
