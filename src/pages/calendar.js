import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // For week and day views
import interactionPlugin from '@fullcalendar/interaction'; // For dateClick, eventClick, and selection
import { v4 as uuidv4 } from 'uuid';  // To generate unique event IDs

const CalendarView = () => {
  const [events, setEvents] = useState([]);

  // Handle event creation (with date and time selection)
  const handleSelect = (selectionInfo) => {
    const title = prompt('Enter event title:');
    if (title) {
      const newEvent = {
        id: uuidv4(),
        title,
        start: selectionInfo.start,
        end: selectionInfo.end,  
        allDay: selectionInfo.allDay
      };
      setEvents([...events, newEvent]);
    }
  };

  // Handle editing an event
  const handleEventClick = (eventClickInfo) => {
    const action = prompt('Type "edit" to edit event, "delete" to delete event:', 'edit');
    if (action === 'edit') {
      const newTitle = prompt('Enter new event title:', eventClickInfo.event.title);
      if (newTitle) {
        const updatedEvents = events.map((event) =>
          event.id === eventClickInfo.event.id ? { ...event, title: newTitle } : event
        );
        setEvents(updatedEvents);
      }
    } else if (action === 'delete') {
      handleEventDelete(eventClickInfo.event.id);
    }
  };

  // Handle deleting an event
  const handleEventDelete = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (confirmed) {
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
    }
  };

  return (
    <div>
      <h2>Daycare Event Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        selectable={true}          // Enable date and time range selection
        selectMirror={true}        // Display selected time ranges
        select={handleSelect}      // Handle selection (for event creation)
        eventClick={handleEventClick} // Handle event editing/deletion
        editable={true}            // Allow dragging and resizing events
        droppable={true}           // Enable external event drops
        allDaySlot={false}         // Disable all-day slot for better time-based selection
      />
    </div>
  );
};

export default CalendarView;
