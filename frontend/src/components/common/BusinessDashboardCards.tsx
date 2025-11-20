// src/components/common/BusinessDashboardCards.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { FaRupeeSign, FaUsers } from "react-icons/fa";
import { getAllBusiness } from "../../helpers/business.service";
import { BusinessModel } from "../../helpers/business.model";

interface BusinessStats {
  avgIncomeBefore: number;
  avgIncomeAfter: number;
  avgCustomersBefore: number;
  avgCustomersAfter: number;
}

const BusinessDashboardCards: React.FC = () => {
  const [stats, setStats] = useState<BusinessStats>({
    avgIncomeBefore: 0,
    avgIncomeAfter: 0,
    avgCustomersBefore: 0,
    avgCustomersAfter: 0,
  });

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("md", "dark-lg");

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const data: BusinessModel[] = await getAllBusiness();

        if (!data.length) return;

        const n = data.length;

        // Calculate averages
        const avgIncomeBefore = Math.round(
          data.reduce((sum, b) => sum + (b.income_before ?? 0), 0) / n
        );
        const avgIncomeAfter = Math.round(
          data.reduce((sum, b) => sum + (b.income_after ?? 0), 0) / n
        );
        const avgCustomersBefore = Math.round(
          data.reduce((sum, b) => sum + (b.customers_before ?? 0), 0) / n
        );
        const avgCustomersAfter = Math.round(
          data.reduce((sum, b) => sum + (b.customers_after ?? 0), 0) / n
        );

        setStats({
          avgIncomeBefore,
          avgIncomeAfter,
          avgCustomersBefore,
          avgCustomersAfter,
        });
      } catch (error) {
        console.error("Failed to fetch business data", error);
      }
    };

    fetchBusinessData();
  }, []);

  // Percentage change calculated from the averages
  const percentageChange = (before: number, after: number) => {
    if (before === 0) return after ? 100 : 0;
    return Math.round(((after - before) / before) * 100);
  };

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const cardData = [
    {
      label: "Avg Income",
      icon: FaRupeeSign ,
      before: stats.avgIncomeBefore,
      after: stats.avgIncomeAfter,
      color: "green.400",
      isCurrency: true,
    },
    {
      label: "Avg Customers",
      icon: FaUsers,
      before: stats.avgCustomersBefore,
      after: stats.avgCustomersAfter,
      color: "blue.400",
      isCurrency: false,
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {cardData.map((card) => {
        const change = percentageChange(card.before, card.after);
        const isPositive = change >= 0;

        return (
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
                <Text fontSize="sm" color="gray.500">
                  {card.label}
                </Text>
                <Stat>
                  <StatNumber>
                    Before:{" "}
                    {card.isCurrency
                      ? currencyFormatter.format(card.before)
                      : card.before}
                    {" | "}After:{" "}
                    {card.isCurrency
                      ? currencyFormatter.format(card.after)
                      : card.after}
                  </StatNumber>
                  <StatHelpText color={isPositive ? "green.400" : "red.400"}>
                    {isPositive ? "+" : ""}
                    {change}%
                  </StatHelpText>
                </Stat>
              </Box>
            </HStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

export default BusinessDashboardCards;
