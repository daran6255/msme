// DashboardAttendanceCards.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatNumber,
  useColorModeValue,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { FaChartLine, FaMobileAlt, FaBook } from "react-icons/fa";
import { getAllAttendance } from "../../helpers/attendance.service";
import { AttendanceModel } from "../../helpers/attendance.model";

interface AttendanceCounts {
  digitalMarketing: number;
  digitalPayments: number;
  financialLiteracy: number;
}

const DashboardAttendanceCards: React.FC = () => {
  const [counts, setCounts] = useState<AttendanceCounts>({
    digitalMarketing: 0,
    digitalPayments: 0,
    financialLiteracy: 0,
  });

  const [attendanceData, setAttendanceData] = useState<AttendanceModel[]>([]);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await getAllAttendance();
        setAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance records", error);
      }
    };
    fetchAttendance();
  }, []);

  useEffect(() => {
    // Function to count unique candidate IDs per session
    const countUniqueBySession = (sessionName: string) => {
      const candidatesSet = new Set(
        attendanceData
          .filter((a) => a.session_name?.includes(sessionName))
          .map((a) => a.candidate_id) // Use candidate_id or unique field
      );
      return candidatesSet.size;
    };

    setCounts({
      digitalMarketing: countUniqueBySession("Digital Marketing"),
      digitalPayments: countUniqueBySession("Digital Payments"),
      financialLiteracy: countUniqueBySession("Financial Literacy"),
    });
  }, [attendanceData]);

  const cardData = [
    { label: "Digital Marketing", count: counts.digitalMarketing, icon: FaChartLine, color: "teal.500" },
    { label: "Digital Payments", count: counts.digitalPayments, icon: FaMobileAlt, color: "orange.400" },
    { label: "Financial Literacy", count: counts.financialLiteracy, icon: FaBook, color: "purple.500" },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
      {cardData.map((card) => (
        <Box
          key={card.label}
          bg={cardBg}
          shadow={cardShadow}
          p={6}
          borderRadius="lg"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
        >
          <HStack spacing={4} align="center">
            <Icon as={card.icon} w={10} h={10} color={card.color} />
            <Box>
              <Text fontSize="sm" color="gray.500">{card.label}</Text>
              <Stat>
                <StatNumber fontSize="2xl" fontWeight="bold">{card.count}</StatNumber>
              </Stat>
            </Box>
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default DashboardAttendanceCards;
