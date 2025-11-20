import React, { useEffect, useState } from "react";
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
  Checkbox,
  useToast,
  Text,
} from "@chakra-ui/react";

import {
  getAllAttendance,
  createAttendance,
} from "../../helpers/attendance.service";
import { getAllCandidates } from "../../helpers/registration.service";
import { AttendanceModel } from "../../helpers/attendance.model";
import { CandidateRegistration } from "../../helpers/registration.model";

const ITEMS_PER_PAGE = 5;

const AttendanceTable: React.FC = () => {
  // Data
  const [attendanceData, setAttendanceData] = useState<AttendanceModel[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterSession, setFilterSession] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal + form
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [candidateList, setCandidateList] = useState<CandidateRegistration[]>(
    []
  );
  const [formData, setFormData] = useState({
    candidate_id: "",
    session_name: "", // single string in form, convert to array on submit
    date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
    attended: true,
    remarks: "",
  });

  const toast = useToast();

  // UI tokens
  const tableHeadBg = useColorModeValue("gray.50", "gray.700");

  // Fetch attendance records
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAllAttendance();
      setAttendanceData(res);
      setFilteredData(res);
    } catch (err) {
      console.error("fetchAttendance:", err);
      toast({ title: "Failed to load attendance", status: "error", isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidate list for modal
  const fetchCandidates = async () => {
    try {
      const res = await getAllCandidates();
      setCandidateList(res);
    } catch (err) {
      console.error("fetchCandidates:", err);
      toast({ title: "Failed to load candidates", status: "error", isClosable: true });
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchCandidates(); // <-- fetch candidates on mount
  }, []);

  // Apply filters when attendanceData, filterDate or filterSession changes
  useEffect(() => {
    let data = [...attendanceData];

    if (filterDate) {
      data = data.filter((d) => d.date === filterDate);
    }

    if (filterSession) {
      data = data.filter(
        (d) => d.session_name && d.session_name.some((s) => s === filterSession)
      );
    }

    setFilteredData(data);
    setCurrentPage(1);
  }, [attendanceData, filterDate, filterSession]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginated = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setFilterDate("");
    setFilterSession("");
    setFilteredData(attendanceData);
  };

  // Open modal and fetch candidates
  const onMarkAttendance = async () => {
    await fetchCandidates();
    // reset simple form defaults
    setFormData({
      candidate_id: "",
      session_name: "",
      date: new Date().toISOString().slice(0, 10),
      attended: true,
      remarks: "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.candidate_id) {
      toast({ title: "Select candidate", status: "warning", isClosable: true });
      return;
    }
    if (!formData.session_name) {
      toast({ title: "Select session", status: "warning", isClosable: true });
      return;
    }

    const payload: AttendanceModel = {
      candidate_id: formData.candidate_id,
      session_name: [formData.session_name], // backend expects string[]
      attended: formData.attended,
      date: formData.date,
      remarks: formData.remarks || undefined,
    };

    try {
      await createAttendance(payload);
      toast({ title: "Attendance marked", status: "success", isClosable: true });
      onClose();
      fetchAttendance();
    } catch (err) {
      console.error("handleSubmit:", err);
      toast({ title: "Failed to mark attendance", status: "error", isClosable: true });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="240px">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box p={5} borderWidth={1} borderRadius="xl">
      {/* Filters + Action */}
      <Flex mb={4} justify="space-between" align="center">
        <Flex gap={4} align="flex-end">
          <Box>
            <Text fontSize="sm" mb={1}>Date</Text>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              size="sm"
            />
          </Box>

          <Box>
            <Text fontSize="sm" mb={1}>Session</Text>
            <Select
              placeholder="All sessions"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              size="sm"
              width="220px"
            >
              {/* These can be fetched dynamically; keeping static sample values */}
              <option value="Financial Literacy">Financial Literacy</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Digital Payments">Digital Payments</option>
            </Select>
          </Box>

          <Box>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Clear
            </Button>
          </Box>
        </Flex>

        <Button colorScheme="blue" onClick={onMarkAttendance}>
          Mark Attendance
        </Button>
      </Flex>

      {/* Table */}
      <Table variant="simple">
        <Thead bg={tableHeadBg}>
          <Tr>
            <Th>Candidate</Th>
            <Th>Session</Th>
            <Th>Date</Th>
            <Th>Attended</Th>
            <Th>Remarks</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.map((row) => (
            <Tr key={row.id}>
              <Td>
                {/* show candidate name if available from earlier candidateList cache;
                    otherwise show id */}
                {candidateList.find((c) => c.id === row.candidate_id)?.name || row.candidate_id}
              </Td>
              <Td>{row.session_name?.join(", ") ?? "-"}</Td>
              <Td>{row.date ?? "-"}</Td>
              <Td>{row.attended ? "Yes" : "No"}</Td>
              <Td>{row.remarks ?? "-"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Pagination */}
      <Flex mt={4} justify="space-between" align="center">
        <Text>Page {currentPage} of {totalPages}</Text>

        <Flex gap={2}>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            isDisabled={currentPage === 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Flex>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mark Attendance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Candidate</FormLabel>
              <Select
                placeholder="Select candidate"
                value={formData.candidate_id}
                onChange={(e) => setFormData({ ...formData, candidate_id: e.target.value })}
              >
                {candidateList.map((c) => (
                  <option value={c.id} key={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Session</FormLabel>
              <Select
                placeholder="Choose session"
                value={formData.session_name}
                onChange={(e) => setFormData({ ...formData, session_name: e.target.value })}
              >
                <option value="financial_literacy">Financial Literacy</option>
                <option value="digital_marketing">Digital Marketing</option>
                <option value="digital_payments">Digital Payments</option>
              </Select>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </FormControl>

            <FormControl mb={3}>
              <Checkbox
                isChecked={formData.attended}
                onChange={(e) => setFormData({ ...formData, attended: e.target.checked })}
              >
                Attended
              </Checkbox>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Remarks</FormLabel>
              <Input
                placeholder="Remarks (optional)"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
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

export default AttendanceTable;
