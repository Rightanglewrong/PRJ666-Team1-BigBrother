// src/components/weeklyReportSender.js

import React, { useState, useEffect } from "react";
import { sendWeeklyProgressReports } from "../utils/progressReportAPI";
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import SnackbarNotification from "../components/Modal/SnackBar";

const SendWeeklyReports = ({ locationID }) => {
    // Function to calculate the current week's Monday and Sunday
    const getCurrentWeekDates = () => {
        const currentDate = new Date();
        const currentDay = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() - ((currentDay + 6) % 7)); // Calculate Monday

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6); // Calculate Sunday

        return {
            startDate: monday.toISOString().split("T")[0], // Format as YYYY-MM-DD
            endDate: sunday.toISOString().split("T")[0],
        };
    };

    const [week, setWeek] = useState(getCurrentWeekDates()); // Initialize with current week
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleSendWeeklyReports = async () => {
        if (!week.startDate || !week.endDate) {
            setErrorMessage("Please specify a valid date range.");
            setSnackbarOpen(true); // Show snackbar for errors
            return;
        }

        try {
            setLoading(true);
            const response = await sendWeeklyProgressReports(locationID, week);
            setMessage(response.message || "Weekly progress reports sent successfully!");
            setErrorMessage("");
            setSnackbarOpen(true); // Show snackbar for success
        } catch (error) {
            setErrorMessage(error.message || "Failed to send weekly progress reports.");
            setMessage("");
            setSnackbarOpen(true); // Show snackbar for errors
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Send Weekly Progress Reports
            </Typography>
            <TextField
                label="Start Date"
                type="date"
                value={week.startDate}
                onChange={(e) => setWeek((prev) => ({ ...prev, startDate: e.target.value }))}
                fullWidth
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                }}
                sx={{ mb: 2 }}
            />
            <TextField
                label="End Date"
                type="date"
                value={week.endDate}
                onChange={(e) => setWeek((prev) => ({ ...prev, endDate: e.target.value }))}
                fullWidth
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                }}
                sx={{ mb: 2 }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleSendWeeklyReports}
                disabled={loading}
                sx={{ textTransform: "none" }}
            >
                {loading ? "Sending..." : "Send Weekly Reports"}
            </Button>
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}

            {/* SnackbarNotification Component */}
            <SnackbarNotification
                open={snackbarOpen}
                message={errorMessage || message}
                severity={errorMessage ? "error" : "success"}
                onClose={handleSnackbarClose}
            />
        </Box>
    );
};

export default SendWeeklyReports;
