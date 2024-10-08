import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { v4 as uuidv4 } from "uuid";
import styles from "./calendar.module.css";

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal
  const [editingEvent, setEditingEvent] = useState(null); // Editing event
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
  });

  // Handle event creation
  const handleSelect = (selectionInfo) => {
    setNewEvent({
      title: "",
      start: selectionInfo.startStr,
      end: selectionInfo.endStr,
    });
    setEditingEvent(null); // Reset editingEvent when creating a new event
    setShowModal(true);
  };

  // Handle editing an event
  const handleEventClick = (eventClickInfo) => {
    const event = events.find((e) => e.id === eventClickInfo.event.id);
    if (event) {
      setNewEvent({
        title: event.title,
        start: event.start,
        end: event.end,
      });
      setEditingEvent(event.id); // Set the event ID to know we are editing
      setShowModal(true);
    }
  };

  // Save or update event
  const handleSubmitEvent = () => {
    if (!newEvent.title) {
      alert("Event title is required.");
      return;
    }

    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map((event) =>
        event.id === editingEvent
          ? {
              ...event,
              title: newEvent.title,
              start: newEvent.start,
              end: newEvent.end,
            }
          : event
      );
      setEvents(updatedEvents);
      setEditingEvent(null);
    } else {
      // Add new event
      const newCreatedEvent = {
        id: uuidv4(),
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
      };
      setEvents([...events, newCreatedEvent]);
    }
    setShowModal(false);
  };

  // Handle deleting an event with custom modal
  const handleEventDelete = () => {
    setShowDeleteModal(true); // Show delete confirmation modal
  };

  // Confirm the event deletion
  const confirmDeleteEvent = () => {
    const updatedEvents = events.filter((event) => event.id !== editingEvent);
    setEvents(updatedEvents);
    setShowDeleteModal(false);
    setShowModal(false);
    setEditingEvent(null); // Reset editingEvent after deletion
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
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              required
            />

            {/* Event Start and End Time */}
            <label>Start Time:</label>
            <input
              className={styles.input}
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: e.target.value })
              }
              required
            />
            <label>End Time:</label>
            <input
              className={styles.input}
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: e.target.value })
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
