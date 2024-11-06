// src/pages/admin/activity-log.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchLogsByLocation } from "../../utils/activityLogAPI";
import {
  Button,
  TextField,
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
import styles from "./ActivityLogPage.module.css";

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [locationID, setLocationID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const formattedStartDate = formatDateToISOString(startDate);
      const formattedEndDate = formatDateToISOString(endDate);

      const response = await fetchLogsByLocation(
        token,
        locationID,
        formattedStartDate,
        formattedEndDate
      );
      setLogs(response.logs);
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
        <TextField
          label="Location ID"
          variant="outlined"
          value={locationID}
          onChange={(e) => setLocationID(e.target.value)}
          className={styles.filterField}
        />
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.filterField}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.filterField}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchLogs}
          className={styles.filterButton}
        >
          Fetch Logs
        </Button>
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
