import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"; // For week and day views
import interactionPlugin from "@fullcalendar/interaction"; // For dateClick, eventClick, and selection
import {
  createCalendarEntryInDynamoDB,
  updateCalendarEntryInDynamoDB,
  deleteCalendarEntryFromDynamoDB,
  retrieveCalendarEntriesByDate,
} from "../utils/calendarEntryAPI";
import { getCurrentUser } from "../utils/api";
import { useUser } from "@/components/authenticate";
import { withAuth } from "@/hoc/withAuth";
import styles from "./calendar.module.css";
import { useCallback } from 'react';

const CalendarView = () => {
  const user = useUser();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal
  const [editingEvent, setEditingEvent] = useState(null); // Editing event
  const [newEvent, setNewEvent] = useState({
    entryTitle: "",
    description: "",
    dateStart: "",
    dateEnd: "",
    createdBy: "",
    locationID: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);



  // Format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    if (!date) return "";
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) return ""; // Handle invalid dates
    return date.toISOString().split("T")[0];
  };

  // Handle date string conversion for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Handle invalid dates
    return formatDateToYYYYMMDD(date);
  };

  // Function to load calendar entries by date range
  const loadCalendarEntries = useCallback(async () => {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Start date: 1 year ago
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // End date: 1 year from now

    try {
      const entries = await retrieveCalendarEntriesByDate(
        formatDateToYYYYMMDD(startDate),
        formatDateToYYYYMMDD(endDate),
        user.locationID
      );

      if (entries.length === 0) {
        setErrorMessage("No events found.");
        setShowErrorModal(false);
      } else {
        const formattedEvents = entries.map((entry) => ({
          id: entry.calEntryID,
          title: entry.entryTitle,
          start: formatDateToYYYYMMDD(entry.dateStart),
          end: formatDateToYYYYMMDD(entry.dateEnd),
          description: entry.description,
          allDay: true,
        }));
        setEvents(formattedEvents);
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Error fetching calendar entries.");
      setShowErrorModal(true);
      console.error("Error fetching calendar entries:", error);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserDataAndLoadEvents = async () => {
      if (user) {
        setIsAuthorized(
          user.accountType === "Admin" || user.accountType === "Staff"
        );
        setNewEvent((prev) => ({
          ...prev,
          createdBy: user.userID,
          locationID: user.locationID,
        }));
        await loadCalendarEntries();
      }
  };

    fetchUserDataAndLoadEvents();
  }, [loadCalendarEntries, user]);

  // Handle event creation (with date and time selection)
  const handleSelect = (selectionInfo) => {
    if (!isAuthorized) {
      setErrorMessage("Unauthorized: Only admin or staff can create events.");
      setShowErrorModal(true);
      return;
    }

    const startDate = new Date(selectionInfo.start);
    const endDate = new Date(selectionInfo.end);

    setNewEvent({
      entryTitle: "",
      description: "",
      dateStart: formatDateToYYYYMMDD(startDate),
      dateEnd: formatDateToYYYYMMDD(endDate),
      createdBy: user.userID || "",
    });
    setEditingEvent(null); // Reset editingEvent when creating a new event
    setShowModal(true);
  };

  // Handle editing an event
  const handleEventClick = (eventClickInfo) => {
    const event = events.find((e) => e.id === eventClickInfo.event.id);
    if (event) {
      setNewEvent({
        entryTitle: event.title,
        description: event.description || "",
        dateStart: formatDateForDisplay(event.start),
        dateEnd: formatDateForDisplay(event.end),
        createdBy: user.userID || "",
      });
      setEditingEvent(event.id); // Set the event ID to know we are editing
      setShowModal(true);
    }
  };

  // Save or update event
  const handleSubmitEvent = async () => {
    if (!newEvent.entryTitle) {
      setErrorMessage("Event title is required.");
      setShowErrorModal(true);
      return;
    }

    if (!isAuthorized) {
      setErrorMessage("Unauthorized: Only admin or staff can update events.");
      setShowErrorModal(true);
      return;
    }

    try {
      // Ensure dates are valid before proceeding
      const startDate = formatDateToYYYYMMDD(newEvent.dateStart);
      const endDate = formatDateToYYYYMMDD(newEvent.dateEnd);

      if (!startDate || !endDate) {
        setErrorMessage("Invalid date format");
        setShowErrorModal(true);
        return;
      }

      const eventData = {
        ...newEvent,
        dateStart: formatDateToYYYYMMDD(newEvent.dateStart),
        dateEnd: formatDateToYYYYMMDD(newEvent.dateEnd),
        createdBy: user.userID,
        locationID: user.locationID,
      };

      if (editingEvent) {
        await updateCalendarEntryInDynamoDB({ ...eventData, id: editingEvent });
      } else {
        await createCalendarEntryInDynamoDB(eventData);
      }

      await loadCalendarEntries();
      setShowModal(false);
      setEditingEvent(null);
    } catch (error) {
      setErrorMessage(
        editingEvent ? "Error updating event." : "Error creating new event."
      );
      setShowErrorModal(true);
      console.error(
        editingEvent ? "Error updating event:" : "Error creating new event:",
        error
      );
    }
  };

  // Handle deleting an event with custom modal
  const handleEventDelete = () => {
    if (!isAuthorized) {
      setErrorMessage("Unauthorized: Only admin or staff can delete events.");
      setShowErrorModal(true);
      return;
    }
    setShowDeleteModal(true); // Show delete confirmation modal
  };

  // Confirm the event deletion
  const confirmDeleteEvent = async () => {
    try {
      await deleteCalendarEntryFromDynamoDB({ id: editingEvent });
      const updatedEvents = events.filter((event) => event.id !== editingEvent);
      setEvents(updatedEvents);
      setShowDeleteModal(false);
      setShowModal(false);
      setEditingEvent(null); // Reset editingEvent after deletion
    } catch (error) {
      setErrorMessage("Error deleting event.");
      setShowErrorModal(true);
      console.error("Error deleting event:", error);
    }
  };

  // Close modal and reset editingEvent state
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null); // Reset editingEvent when closing the modal
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <div className={styles.calendarContainer}>
      <h2>Daycare Event Calendar</h2>
      <div className={styles.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleSelect}
          eventClick={handleEventClick}
          editable={false}
          droppable={true}
          height={700} // Set your desired calendar height
          aspectRatio={1.5} // Adjust aspect ratio
        />
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>{editingEvent ? "Edit Event" : "Create New Event"}</h3>

            {/* Event Title */}
            <input
              className={styles.input}
              type="text"
              placeholder="Enter event title"
              value={newEvent.entryTitle}
              onChange={(e) =>
                setNewEvent({ ...newEvent, entryTitle: e.target.value })
              }
              required
            />

            <label>Description</label>
            <input
              className={styles.input}
              placeholder="Enter event description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              required
            />

            {/* Event Start and End Time */}
            <label>Start Date:</label>
            <input
              className={styles.input}
              type="date"
              value={newEvent.dateStart}
              onChange={(e) =>
                setNewEvent({ ...newEvent, dateStart: e.target.value })
              }
              required
            />
            <label>End Date:</label>
            <input
              className={styles.input}
              type="date"
              value={newEvent.dateEnd}
              onChange={(e) =>
                setNewEvent({ ...newEvent, dateEnd: e.target.value })
              }
              required
            />

            <div className={styles.modalActions}>
              <button className={styles.saveButton} onClick={handleSubmitEvent}>
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
              {editingEvent && (
                <button
                  className={styles.deleteButton}
                  onClick={handleEventDelete}
                >
                  Delete Event
                </button>
              )}
              <button
                className={styles.cancelButton}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Confirm Event Deletion</h3>
            <br />
            <p>Are you sure you want to delete this event?</p>
            <br />
            <div className={styles.modalActions}>
              <button
                className={styles.deleteButton}
                onClick={confirmDeleteEvent}
              >
                Confirm
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Error Modal */}
      {showErrorModal && errorMessage !== "No events found." && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <div className={styles.modalButtons}>
              <button onClick={handleCloseErrorModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(CalendarView);
