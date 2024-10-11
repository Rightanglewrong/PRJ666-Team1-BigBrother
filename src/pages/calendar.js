
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
        entryTitle: "",
        description: '',
        dateStart: "",
        dateEnd: "",
        createdBy: "",
    });
    const [userDetails, setUserDetails] = useState(null);
    const [userId, setUserId] = useState(''); 
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Format date to YYYY-MM-DD
    const formatDateToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    //Format date back to datetime-local
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
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
                title: entry.entryTitle,
                start: entry.dateStart,
                end: entry.dateEnd,
                description: entry.description,
                allDay: true // Adjust as necessary
            })));
      } catch (error) {
        setErrorMessage('Error fetching calendar entries.');
        setShowErrorModal(true); 
        console.error('Error fetching calendar entries:', error);
      }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUserDetails(currentUser); 
    if (currentUser) {
        setUserId(currentUser.userID); 
        setNewEvent(prev => ({ ...prev, createdBy: userId })); 
        if (currentUser.accountType === 'Admin' || currentUser.accountType === 'Staff') {
            setIsAuthorized(true);
        }
    }
    loadCalendarEntries();
}, []);



  // Handle event creation (with date and time selection)

    const handleSelect = (selectionInfo) => {
      if (!isAuthorized) {
        setErrorMessage('Unauthorized: Only admin or staff can create events.');
        setShowErrorModal(true);
        return;
      }
        setNewEvent({
          entryTitle: "",
          description: "",
          dateStart: selectionInfo.startStr,
          dateEnd: selectionInfo.endStr,
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
                dateStart: formatDateForInput(event.start),
                dateEnd: formatDateForInput(event.end),
            });
            setEditingEvent(event.id); // Set the event ID to know we are editing
            setShowModal(true);
        }
    };

    // Save or update event
    const handleSubmitEvent = async () => {
        if (!newEvent.entryTitle) {
            setErrorMessage('Event title is required.');
            setShowErrorModal(true);
            return;
        }

        if (!isAuthorized) {
          setErrorMessage('Unauthorized: Only admin or staff can update events.');
          setShowErrorModal(true);
          return;
        }
        const currentUser = getCurrentUser();
        const createdBy = currentUser ? currentUser.userID : '';

        if (editingEvent) {
            // Update existing event
            const updatedEvent = {
                ...newEvent,
                id: editingEvent,
                description: newEvent.description,
                dateStart: newEvent.dateStart,
                dateEnd: newEvent.dateEnd,
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
                  dateStart: newEvent.dateStart,
                  dateEnd: newEvent.dateEnd,
                }
              : event
          );
          setEvents(updatedEvents);
        } catch (error) {
          setErrorMessage('Error updating event.');
          setShowErrorModal(true);
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
          setErrorMessage('Error creating new event.');
          setShowErrorModal(true);
          console.error("Error creating new event:", error);
        }
      }
      await loadCalendarEntries();
      setShowModal(false);
    };

    // Handle deleting an event with custom modal
    const handleEventDelete = () => {

      if (!isAuthorized) {
        setErrorMessage('Unauthorized: Only admin or staff can delete events.');
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
        setErrorMessage('Error deleting event.');
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
        {/* Error Modal */}
        {showErrorModal && (
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

export default CalendarView;
