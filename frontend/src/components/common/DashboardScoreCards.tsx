import { useEffect, useState, useCallback } from "react";
import {
  Box,
  SimpleGrid,
  HStack,
  VStack,
  Text,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUsers, FaMale, FaFemale, FaCheckCircle, FaBan } from "react-icons/fa";
import { getAllCandidates } from "../../helpers/registration.service";

interface Candidate {
  status?: string;
  gender?: string;
}

const DashboardStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    discontinued: 0,
    male: 0,
    female: 0,
  });

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // 🔥 Prevent re-render loop using useCallback
  const fetchData = useCallback(async () => {
    try {
      const data: Candidate[] = await getAllCandidates();

      setStats({
        total: data.length,
        active: data.filter((d) => d.status?.toLowerCase() === "active").length,
        discontinued: data.filter((d) => d.status?.toLowerCase() === "inactive").length,
        male: data.filter((d) => d.gender?.toLowerCase() === "male").length,
        female: data.filter((d) => d.gender?.toLowerCase() === "female").length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]); // ✔ Fixed warning

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
      {/* Total Registered */}
      <Box bg={cardBg} p={6} rounded="xl" shadow="md" border="1px solid" borderColor={borderColor} display="flex" alignItems="center">
        <HStack spacing={4}>
          <Icon as={FaUsers} boxSize={10} color="blue.500" />
          <VStack spacing={0} align="start">
            <Text fontSize="sm" color={labelColor}>Total Registered</Text>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>{stats.total}</Text>
          </VStack>
        </HStack>
      </Box>

      {/* Status Overview */}
      <Box bg={cardBg} p={6} rounded="xl" shadow="md" border="1px solid" borderColor={borderColor}>
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" color={labelColor}>Status Overview</Text>
          <HStack w="100%" justify="space-between">
            <HStack>
              <Icon as={FaCheckCircle} boxSize={7} color="green.500" />
              <Text fontSize="lg" color={textColor}>{stats.active} Active</Text>
            </HStack>
            <HStack>
              <Icon as={FaBan} boxSize={7} color="red.500" />
              <Text fontSize="lg" color={textColor}>{stats.discontinued} Discontinued</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {/* Gender Distribution */}
      <Box bg={cardBg} p={6} rounded="xl" shadow="md" border="1px solid" borderColor={borderColor}>
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" color={labelColor}>Gender Distribution</Text>
          <HStack w="100%" justify="space-between">
            <HStack>
              <Icon as={FaMale} boxSize={7} color="blue.500" />
              <Text fontSize="lg" color={textColor}>{stats.male} Male</Text>
            </HStack>
            <HStack>
              <Icon as={FaFemale} boxSize={7} color="pink.500" />
              <Text fontSize="lg" color={textColor}>{stats.female} Female</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </SimpleGrid>
  );
};

export default DashboardStats;
