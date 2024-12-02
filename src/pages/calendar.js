// src/pages/calendar.js
import React, { useState, useEffect, useCallback } from 'react';
import SnackbarNotification from '@/components/Modal/SnackBar';
import ConfirmationModal from '@/components/Modal/ConfirmationModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTheme } from '@/components/ThemeContext';
import {
  createCalendarEntryInDynamoDB,
  updateCalendarEntryInDynamoDB,
  deleteCalendarEntryFromDynamoDB,
  retrieveCalendarEntriesByDate,
} from '../utils/calendarEntryAPI';
import { useUser } from '@/components/authenticate';
import { withAuth } from '@/hoc/withAuth';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  Box,
} from '@mui/material';
import styles from './calendar.module.css';

const CalendarView = () => {
  const user = useUser();
  const { darkMode, colorblindMode, handMode } = useTheme();

  const [events, setEvents] = useState([]);
  const [modalProps, setModalProps] = useState({
    open: false,
    mode: 'create',
    event: null,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Dark mode and colorblind styles
  const themeStyles = {
    text: darkMode ? '#f1f1f1' : '#333',
    background: darkMode ? '#121212' : '#ffffff',
    container: darkMode ? '#1E1E1E' : '#f7f9fc',
    button: {
      primary: colorblindMode === 'red-green' ? '#1976d2' : colorblindMode === 'blue-yellow' ? '#6a0dad' : '#3498db',
      danger: colorblindMode === 'red-green' ? '#d32f2f' : colorblindMode === 'blue-yellow' ? '#c62828' : '#e74c3c',
    },
  };

  const handleAlignment = () => (handMode === 'left' ? 'flex-start' : handMode === 'right' ? 'flex-end' : 'center');

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const loadCalendarEntries = useCallback(async () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    try {
      const entries = await retrieveCalendarEntriesByDate(
        formatDateToYYYYMMDD(startDate),
        formatDateToYYYYMMDD(endDate),
        user.locationID
      );

      if (entries.length > 0) {
        const formattedEvents = entries.map((entry) => ({
          id: entry.calEntryID,
          title: entry.entryTitle,
          start: formatDateToYYYYMMDD(entry.dateStart),
          end: formatDateToYYYYMMDD(entry.dateEnd),
          description: entry.description,
          allDay: true,
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching calendar entries.',
        severity: 'error',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserDataAndLoadEvents = async () => {
      if (user) {
        setIsAuthorized(user.accountType === 'Admin' || user.accountType === 'Staff');
        await loadCalendarEntries();
      }
    };

    fetchUserDataAndLoadEvents();
  }, [loadCalendarEntries, user]);

  const handleSelect = (selectionInfo) => {
    if (!isAuthorized) return;

    setModalProps({
      open: true,
      mode: 'create',
      event: {
        title: '',
        description: '',
        dateStart: formatDateToYYYYMMDD(selectionInfo.start),
        dateEnd: formatDateToYYYYMMDD(selectionInfo.end),
        createdBy: user.userID || '',
        locationID: user.locationID || '',
      },
    });
  };

  const handleEventClick = (eventClickInfo) => {
    const event = events.find((e) => e.id === eventClickInfo.event.id);
    if (event) {
      setModalProps({
        open: true,
        mode: 'view',
        event: {
          ...event,
          dateStart: formatDateToYYYYMMDD(event.start),
          dateEnd: formatDateToYYYYMMDD(event.end),
        },
      });
    }
  };

  const handleModalClose = () => {
    setModalProps((prev) => ({ ...prev, open: false }));
    setTimeout(() => {
      setModalProps({ open: false, mode: 'view', event: null });
    }, 300);
  };

  const handleModalSubmit = async () => {
    const { mode, event } = modalProps;

    try {
      if (!event?.title || event.title.trim() === '') {
        setSnackbar({
          open: true,
          message: 'Event Title is required.',
          severity: 'error',
        });
        return;
      }

      const dbEvent = { ...event, entryTitle: event.title };
      delete dbEvent.title;

      if (mode === 'create') {
        await createCalendarEntryInDynamoDB(dbEvent);
      } else if (mode === 'edit') {
        await updateCalendarEntryInDynamoDB({ ...dbEvent, id: event.id });
      }

      await loadCalendarEntries();
      setSnackbar({
        open: true,
        message: mode === 'create' ? 'Event created successfully.' : 'Event updated successfully.',
        severity: 'success',
      });
      handleModalClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error ${mode === 'create' ? 'creating' : 'updating'} event.`,
        severity: 'error',
      });
    }
  };

  const handleDeleteConfirmation = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    try {
      await deleteCalendarEntryFromDynamoDB({ id: modalProps.event.id });
      setEvents((prev) => prev.filter((event) => event.id !== modalProps.event.id));
      setSnackbar({
        open: true,
        message: 'Event deleted successfully.',
        severity: 'success',
      });
      setShowDeleteModal(false);
      handleModalClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting event.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ backgroundColor: themeStyles.background, color: themeStyles.text, minHeight: '100vh', p: 2 }}>
      <Typography variant="h4" align="center" sx={{ mb: 3 }}>
        Daycare Event Calendar
      </Typography>
      <Box
        sx={{
          backgroundColor: themeStyles.container,
          p: 2,
          borderRadius: 2,
          '& .fc-toolbar': {
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          },
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          selectable={true}
          select={handleSelect}
          eventClick={handleEventClick}
          editable={false}
          droppable={true}
          height={800}
          aspectRatio={1.5}
        />
      </Box>

      <Dialog open={modalProps.open} onClose={handleModalClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {modalProps.mode === 'view'
            ? 'Event Details'
            : modalProps.mode === 'create'
            ? 'Create Event'
            : 'Edit Event'}
        </DialogTitle>
        <DialogContent>
          {modalProps.mode === 'view' ? (
            <Box>
              {/* Title with Shaded Outline */}
              <Box
                sx={{
                  padding: 2,
                  border: '1px solid lightgray',
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  marginBottom: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                  {modalProps.event?.title || 'Untitled Event'}
                </Typography>
              </Box>

              {/* Description with Shaded Outline and Minimum Size */}
              <Box
                sx={{
                  padding: 2,
                  border: '1px solid lightgray',
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  minHeight: '169px',
                  marginBottom: 2,
                }}
              >
                <Typography variant="body1">
                  {modalProps.event?.description || 'No description provided.'}
                </Typography>
              </Box>

              {/* Start and End Dates */}
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <strong>Start Date:</strong> {modalProps.event?.dateStart}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <strong>End Date:</strong> {modalProps.event?.dateEnd}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              {/* Fields for Editing/Creating */}
              <TextField
                label="Event Title"
                fullWidth
                variant="outlined"
                value={modalProps.event?.title || ''}
                onChange={(e) =>
                  setModalProps((prev) => ({
                    ...prev,
                    event: { ...prev.event, title: e.target.value },
                  }))
                }
                margin="dense"
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={modalProps.event?.description || ''}
                onChange={(e) =>
                  setModalProps((prev) => ({
                    ...prev,
                    event: { ...prev.event, description: e.target.value },
                  }))
                }
                margin="dense"
              />
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                value={modalProps.event?.dateStart || ''}
                onChange={(e) =>
                  setModalProps((prev) => ({
                    ...prev,
                    event: { ...prev.event, dateStart: e.target.value },
                  }))
                }
                margin="dense"
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                variant="outlined"
                value={modalProps.event?.dateEnd || ''}
                onChange={(e) =>
                  setModalProps((prev) => ({
                    ...prev,
                    event: { ...prev.event, dateEnd: e.target.value },
                  }))
                }
                margin="dense"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {modalProps.mode === 'view' && isAuthorized && (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setModalProps((prev) => ({ ...prev, mode: 'edit' }))}
              >
                Edit Event
              </Button>
              <Button variant="outlined" color="error" onClick={handleDeleteConfirmation}>
                Delete Event
              </Button>
            </>
          )}
          {(modalProps.mode === 'edit' || modalProps.mode === 'create') && (
            <Button variant="contained" color="primary" onClick={handleModalSubmit}>
              {modalProps.mode === 'edit' ? 'Save Changes' : 'Create Event'}
            </Button>
          )}
          <Button variant="outlined" onClick={handleModalClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        open={showDeleteModal}
        title="Confirm Event Deletion"
        description="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={confirmDeleteEvent}
        onCancel={() => setShowDeleteModal(false)}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
     </Box>
  );
};

export default withAuth(CalendarView);
