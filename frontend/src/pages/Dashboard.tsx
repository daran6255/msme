import React from "react";
import { Box } from "@chakra-ui/react";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardScoreCards from "../components/common/DashboardScoreCards";
import CandidateTable from "../components/common/CandidateTable";
import AttendanceTable from "../components/common/AttendanceTable";
import BusinessTable from "../components/common/BusinessTable";

const Dashboard: React.FC = () => {
  return (
    <Box h="100vh" w="100vw" overflow="hidden">
      {/* Navbar */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="1000"
        bg="white"
        shadow="md"
      >
        <Navbar />
      </Box>

      {/* Sidebar */}
      <Box
        position="fixed"
        top="64px"
        left="0"
        bottom="0"
        w="250px"
        bg="white"
        shadow="md"
        zIndex="900"
      >
        <Sidebar />
      </Box>

      {/* Scrollable Content */}
      <Box
        ml="250px"
        mt="64px"
        h="calc(100vh - 64px)"
        overflowY="auto"
        p={6}
      >
        <Routes>
          {/* Default page → dashboard/home */}
          <Route
            path=""
            element={
              <>
                <Box mb={6}>
                  <DashboardScoreCards />
                </Box>
                <Box>
                  <CandidateTable />
                </Box>
              </>
            }
          />

          {/* Explicit /home redirect (if needed) */}
          <Route
            path="home"
            element={
              <>
                <Box mb={6}>
                  <DashboardScoreCards />
                </Box>
                <Box>
                  <CandidateTable />
                </Box>
              </>
            }
          />

          {/* Registration */}
          <Route
            path="attendance"
            element={
              <>
                <Box mb={6}>
                  <AttendanceTable />
                </Box>
              </>
            }
          />
          <Route
            path="business"
            element={
              <>
                <Box mb={6}>
                  <BusinessTable />
                </Box>
              </>
            }
          />

          {/* Redirect wrong URL */}
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;
