
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // For week and day views
import interactionPlugin from '@fullcalendar/interaction'; // For dateClick, eventClick, and selection
import {
    createCalendarEntryInDynamoDB,
    updateCalendarEntryInDynamoDB,
    deleteCalendarEntryFromDynamoDB,
    retrieveCalendarEntriesByDate} from '../utils/calendarEntryAPI';
import { getCurrentUser } from '../utils/api'
import styles from "./calendar.module.css";

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal
    const [editingEvent, setEditingEvent] = useState(null); // Editing event
    const [newEvent, setNewEvent] = useState({
        entrytitle: "",
        description: '',
        dateStart: "",
        dateEnd: "",
        createdBy: "",
    });

    // Format date to YYYY-MM-DD
    const formatDateToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Function to load calendar entries by date range
    const loadCalendarEntries = async () => {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1); // Start date: 1 year ago
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // End date: 1 year from now

        // Format dates as YYYY-MM-DD
        const formattedStartDate = formatDateToYYYYMMDD(startDate);
        const formattedEndDate = formatDateToYYYYMMDD(endDate);

      try {
        const entries = await retrieveCalendarEntriesByDate(formattedStartDate, formattedEndDate);
            setEvents(entries.map(entry => ({
                id: entry.calEntryID,
                entrytitle: entry.entryTitle,
                dateStart: entry.dateStart,
                dateEnd: entry.dateEnd,
                allDay: true // Adjust as necessary
            })));
      } catch (error) {
        console.error('Error fetching calendar entries:', error);
      }
  };

    useEffect(() => {
        loadCalendarEntries(); 
        const currentUser = getCurrentUser();
        if (currentUser) {
            setNewEvent((prev) => ({ ...prev, createdBy: currentUser.userID }));
        }
    }, []);


  // Handle event creation (with date and time selection)

    const handleSelect = (selectionInfo) => {
        setNewEvent({
          entryTitle: "",
          dateStart: selectionInfo.startStr,
          dateEnd: selectionInfo.endStr,
          createdBy: newEvent.createdBy,
        });
        setEditingEvent(null); // Reset editingEvent when creating a new event
        setShowModal(true);
    };

    // Handle editing an event
    const handleEventClick = (eventClickInfo) => {
        const event = events.find((e) => e.id === eventClickInfo.event.id);
        if (event) {
            setNewEvent({
                entryTitle: event.entryTitle,
                description: event.description || "",
                dateStart: event.dateStart,
                dateEnd: event.dateEnd,
            });
            setEditingEvent(event.id); // Set the event ID to know we are editing
            setShowModal(true);
        }
    };

    // Save or update event
    const handleSubmitEvent = async () => {
      if (!newEvent.entryTitle) {
        alert("Event title is required.");
        return;
      }
      const currentUser = getCurrentUser();
      const createdBy = currentUser ? currentUser.userID : '';

      if (editingEvent) {
        // Update existing event
        const updatedEvent = {
          ...newEvent,
          id: editingEvent,
          dateStart: dateStart,
          dateEnd: dateEnd,
          createdBy: createdBy,
        };
        try {
          await updateCalendarEntryInDynamoDB(updatedEvent);
          const updatedEvents = events.map((event) =>
            event.id === editingEvent
              ? {
                  ...event,
                  entryTitle: newEvent.entryTitle,
                  description: newEvent.description,
                  dateStart: formatDateToYYYYMMDD(newEvent.dateStart),
                  dateEnd: formatDateToYYYYMMDD(newEvent.dateEnd),
                }
              : event
          );
          setEvents(updatedEvents);
        } catch (error) {
          console.error("Error updating event:", error);
        }
      } else {
        // Add new event
        const newCreatedEvent = {
          entryTitle: newEvent.entryTitle,
          description: newEvent.description,
          dateStart: newEvent.dateStart,
          dateEnd: newEvent.dateEnd,
          createdBy: createdBy,
        };
        try {
          await createCalendarEntryInDynamoDB(newCreatedEvent);
          setEvents([...events, newCreatedEvent]);
        } catch (error) {
          console.error("Error creating new event:", error);
        }
      }
      await loadCalendarEntries();
      setShowModal(false);
    };

    // Handle deleting an event with custom modal
    const handleEventDelete = () => {
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
        console.error("Error deleting event:", error);
      }
    };

    // Close modal and reset editingEvent state
    const handleCloseModal = () => {
      setShowModal(false);
      setEditingEvent(null); // Reset editingEvent when closing the modal
    };

    return (
      <div className={styles.calendarContainer}>
        <h2>Daycare Event Calendar</h2>
        <div className={styles.calendarWrapper}>
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
            editable={true}
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
                placeholder='Enter event description'
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                required
              />

              {/* Event Start and End Time */}
              <label>Start Time:</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={newEvent.dateStart}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, dateStart: e.target.value })
                }
                required
              />
              <label>End Time:</label>
              <input
                className={styles.input}
                type="datetime-local"
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
      </div>
    );
};

export default CalendarView;
