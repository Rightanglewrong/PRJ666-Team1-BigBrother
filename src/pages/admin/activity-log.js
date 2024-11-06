// src/pages/admin/activity-log.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchLogsByLocation,
  fetchLogsByUser,
} from "../../utils/activityLogAPI";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import CustomButton from "../../components/Button/CustomButton";
import CustomInput from "../../components/Input/CustomInput";
import styles from "./ActivityLogPage.module.css";
import { useUser } from "@/components/authenticate";

const getDateNDaysFromToday = (daysOffset) =>
  new Date(new Date().setDate(new Date().getDate() + daysOffset))
    .toISOString()
    .split("T")[0];

const ActivityLogPage = () => {
  const { user } = useUser();
  const [logs, setLogs] = useState([]);
  const [searchType, setSearchType] = useState("location"); // Radio button state
  const [locationID, setLocationID] = useState("");
  const [email, setEmail] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [startDate, setStartDate] = useState(getDateNDaysFromToday(-7));
  const [endDate, setEndDate] = useState(getDateNDaysFromToday(1));
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchLogs = async () => {
    try {
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();
      const logsData =
        searchType === "email"
          ? await fetchLogsByUser(
              email,
              formattedStartDate,
              formattedEndDate,
              limit
            )
          : await fetchLogsByLocation(
              locationID,
              formattedStartDate,
              formattedEndDate,
              limit
            );

      setLogs(logsData);
      setError("");
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(
        "Failed to retrieve activity logs. Please check your filters and try again."
      );
    }
  };

  useEffect(() => {
    if (!user) {
      // If user is not logged in, redirect to login page
      router.push("/login");
    } else {
      // Set authorization based on user’s account type
      setIsAuthorized(user.accountType === "Admin");
    }
  }, [user, router]);

  if (isAuthorized == false) {
    return (
      <Typography
        variant="h4"
        align="center"
        color="error"
        sx={{ marginTop: 5 }}
      >
        Unauthorized Access
      </Typography>
    );
  }

  if (isAuthorized === null) {
    return (
      <Typography
        variant="h4"
        align="center"
        color="info"
        sx={{ marginTop: 5 }}
      >
        Loading...
      </Typography>
    );
  }

  return (
    <div className={styles.activityLogContainer}>
      <Typography variant="h3" className={styles.pageTitle} align="center">
        Activity Log
      </Typography>

      <Box
        className={styles.filterContainer}
        sx={{
          padding: "20px",
          borderRadius: "20px",
          backgroundColor: "#FC9BF7",
          boxShadow: "0 4px 8px rgba(1,1,1,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <FormControl component="fieldset" sx={{ marginBottom: 0 }}>
          <FormLabel
            component="legend"
            align="center"
            sx={{ fontWeight: "bold", color: "#3f51b5" }}
          >
            Search By
          </FormLabel>
          <RadioGroup
            row
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            sx={{ display: "flex", gap: 2 }}
          >
            <FormControlLabel
              value="location"
              control={<Radio />}
              label="Location ID"
            />
            <FormControlLabel value="email" control={<Radio />} label="Email" />
          </RadioGroup>
        </FormControl>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {searchType === "location" ? (
            <Box sx={{ flex: 1 }}>
              <CustomInput
                label="Location ID"
                value={locationID}
                onChange={(e) => setLocationID(e.target.value)}
                placeholder="Enter Location ID"
              />
            </Box>
          ) : (
            <Box sx={{ flex: 1 }}>
              <CustomInput
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
              />
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <CustomInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <CustomInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <CustomInput
              label="Limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="Enter Limit"
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CustomButton
              color="primary"
              variant="contained"
              onClick={fetchLogs}
              fullWidth
            >
              Fetch Logs
            </CustomButton>
          </Box>
        </Box>
      </Box>

      {error && (
        <Typography color="error" className={styles.errorText}>
          {error}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        className={styles.tableContainer}
        sx={{ marginTop: 3 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Activity Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>User Email</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No logs found for the specified criteria.
                </TableCell>
              </TableRow>
            ) : (
              Object.values(logs).map((log) => (
                <TableRow key={log.ID}>
                  <TableCell>{log.activityType}</TableCell>
                  <TableCell>{log.desc}</TableCell>
                  <TableCell>{log.userEmail}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
export default ActivityLogPage;
