// src/pages/admin/activity-log.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchLogsByLocation } from "../../utils/activityLogAPI";
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
} from "@mui/material";
import CustomButton from "../../components/Button/CustomButton";
import CustomInput from "../../components/Input/CustomInput";
import styles from "./ActivityLogPage.module.css";

const ActivityLogPage = () => {
  const getDateNDaysFromToday = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };
  
  const [logs, setLogs] = useState([]);
  const [locationID, setLocationID] = useState("");
  const [startDate, setStartDate] = useState(getDateNDaysFromToday(-7)); // Today's date in 'YYYY-MM-DD' format
  const [endDate, setEndDate] = useState(getDateNDaysFromToday(1));
  const [error, setError] = useState("");
  const router = useRouter();

  const formatDateToISOString = (date) => {
    const d = new Date(date);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getUTCDate()).padStart(2, "0")}T00:00:00Z`;
  };

  const fetchLogs = async () => {
    try {
      const formattedStartDate = formatDateToISOString(startDate);
      const formattedEndDate = formatDateToISOString(endDate);

      const logsData = await fetchLogsByLocation(
        locationID,
        formattedStartDate,
        formattedEndDate
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
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className={styles.activityLogContainer}>
      <Typography variant="h4" className={styles.pageTitle}>
        Activity Log
      </Typography>

      <Box className={styles.filterContainer}>
        <CustomInput
          label="Location ID"
          value={locationID}
          onChange={(e) => setLocationID(e.target.value)}
          placeholder="Enter Location ID"
        />
        <CustomInput
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <CustomInput
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <CustomButton color="primary" variant="contained" onClick={fetchLogs}>
          Fetch Logs
        </CustomButton>
      </Box>

      {error && (
        <Typography color="error" className={styles.errorText}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} className={styles.tableContainer}>
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
              logs.map((log) => (
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
