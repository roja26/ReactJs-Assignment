import React, { useState, useEffect } from 'react';
import './App.css';
import { Button, buttonVariants } from "../@/_/components/ui/button";
import { Input } from "../@/_/components/ui/input";
import { Textarea } from "../@/_/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "../@/_/components/ui/dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../@/_/components/ui/toggle-group"
import { saveAs } from "file-saver";


const DAYS_IN_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem("events")) || {});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", startTime: "", endTime: "", description: "", type:"" });
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Store events in localStorage
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const daysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = () => {
    return (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7; // Start with Monday
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setModalOpen(false);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setModalOpen(false);
  };

  // Open Modal on clicking day
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate.toDateString());
    setModalOpen(true);
    setEditingEventIndex(null);
    setNewEvent({ name: "", startTime: "", endTime: "", description: "", type:"" });
    setSearchKeyword('');
  };

  const handleAddOrEditEvent = () => {
    if (!newEvent.name || !newEvent.startTime || !newEvent.endTime) {
      alert("Please fill all required fields.");
      return;
    }

    if (new Date(`1970-01-01T${newEvent.startTime}`) >= new Date(`1970-01-01T${newEvent.endTime}`)) {
      alert("Start time must be before end time.");
      return;
    }

    // Prevent overlapping events
    const dayEvents = events[selectedDate] || [];
    const hasOverlap = dayEvents.some((event, index) => {
      if (index === editingEventIndex) return false;
      return (
        newEvent.startTime < event.endTime && newEvent.endTime > event.startTime
      );
    });

    if (hasOverlap) {
      alert("Event overlaps with an existing event.");
      return;
    }

    const updatedEvents = [...dayEvents];
    if (editingEventIndex !== null) {
      updatedEvents[editingEventIndex] = newEvent;
    } else {
      updatedEvents.push(newEvent);
    }

    setEvents({
      ...events,
      [selectedDate]: updatedEvents,
    });

    setNewEvent({ name: "", startTime: "", endTime: "", description: "", type:"" });
    setModalOpen(false);
  };

  const handleDeleteEvent = (index) => {
    const updatedEvents = { ...events };
    updatedEvents[selectedDate].splice(index, 1);
    if (updatedEvents[selectedDate].length === 0) delete updatedEvents[selectedDate];
    setEvents(updatedEvents);
  };

  const handleEditEvent = (index) => {
    const eventToEdit = events[selectedDate][index];
    setNewEvent(eventToEdit);
    setEditingEventIndex(index);
    setModalOpen(true);
  };

  const renderCalendarGrid = () => {
    const days = [];

    for (let i = 0; i < firstDayOfMonth(); i++) {
      days.push(<div key={`empty-${i}`} className="empty"></div>);
    }

    for (let day = 1; day <= daysInMonth(); day++) {
      const isToday = new Date().toDateString() ===
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      const isSelected = selectedDate ===
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      const isWeekend = (new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() % 7) === 0 || 
        (new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() % 7) === 6;

      const hasEvents = events[new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()];

      // Colour code days
      const dayClasses = [
        "calendar-day",
        isToday ? "today" : "",
        isSelected ? "selected" : "",
        isWeekend ? "weekend" : "default-day"
      ].filter(Boolean).join(" ");

      days.push(
        <div
          key={day}
          className={dayClasses}
          onClick={() => handleDateClick(day)}
        >
          {day}
          {hasEvents && <div className="event-dot"></div>}
        </div>
      );
    }
    return days;
  };

  // Export events as JSON or CSV
  const exportEvents = (format) => {
    const monthKey = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const monthEvents = Object.keys(events)
      .filter((date) => new Date(date).getMonth() === currentDate.getMonth())
      .reduce((acc, date) => ({ ...acc, [date]: events[date] }), {});
  
    const data = format === "json" ? JSON.stringify(monthEvents, null, 2) : convertToCSV(monthEvents);
    const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `events-${monthKey}.${format}`);
  };
  
  const convertToCSV = (obj) => {
    const rows = [];
    Object.entries(obj).forEach(([date, dayEvents]) => {
      dayEvents.forEach((event) => {
        rows.push(
          `${date},${event.name},${event.startTime},${event.endTime},${event.description || ""},${event.type}`
        );
      });
    });
    return "Date,Name,Start Time,End Time,Description,Type\n" + rows.join("\n");
  };

  // Enable search by keywords for events
  const filteredEvents = (events[selectedDate] || []).filter(event => 
    !searchKeyword || 
    event.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
    event.type.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <header className="calendar-header">
          <Button className="button-calendar" onClick={handlePrevMonth}>Previous</Button>
          <h1 className="calendar-header-title">
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </h1>
          <Button className="button-calendar" onClick={handleNextMonth}>Next</Button>
        </header>

        <div className="calendar">
          <div className="calendar-weekdays">
            {DAYS_IN_WEEK.map((day) => (
              <div 
                key={day} 
                className={`calendar-weekday ${["Sat", "Sun"].includes(day) ? "weekend-day" : "weekday"}`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {renderCalendarGrid()}
          </div>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent 
            className="modal-content" 
            style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '1rem' }}
          >
            <DialogHeader className="modal-header">
              <DialogTitle className="modal-title">
                Events for {selectedDate}
              </DialogTitle>
            </DialogHeader>

            {/* Search Input */}
            <Input 
              placeholder="Search events..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full"
              style={{ marginBottom: '1rem' }}
            />

            {/* Events List */}
            <div 
              className="events-container" 
              style={{ flexGrow: 1, overflowY: 'auto', padding: '0.5rem' }}
            >
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <div 
                    key={index} 
                    className="event-item"
                    style={{ marginBottom: '1rem' }}
                  >
                    <div className="event-details">
                      <h3 className="event-name">{event.name}</h3>
                      <p className="event-time">{event.startTime} - {event.endTime}</p>
                      {event.description && <p className="event-description">{event.description}</p>}
                      <p className={`event-type ${event.type}`}>{event.type}</p> 
                    </div>
                    <div className="event-actions">
                      <Button size="sm" className="button-small" variant="outline" onClick={() => handleEditEvent(index)}>
                        Edit
                      </Button>
                      <Button size="sm" className="button-small" variant="destructive" onClick={() => handleDeleteEvent(index)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', marginTop: '0rem', fontSize: '1.5rem' }}>
                  {(events[selectedDate] || []).length === 0 
                    ? "No events" 
                    : "No events match your search"}
                </p>
              )}
            </div>

            <DialogHeader className="modal-header">
              <DialogTitle className="modal-title">
                Add New Event
              </DialogTitle>
            </DialogHeader>

            {/* Form Section */}
            <div className="modal-form" style={{ padding: '0.5rem' }}>
              <Input
                placeholder="Event Name"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="w-full"
              />
              <div className="time-inputs" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="flex-1"
                />
              </div>
              <Textarea
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full"
                style={{ marginTop: '0.5rem' }}
              />
              <ToggleGroup type="single">
                <ToggleGroupItem value="Work">
                  <Button className={`button-work ${newEvent.type === "Work" ? "clicked" : ""}`} variant="outline" onClick={() => setNewEvent({...newEvent, type:"Work"})}>Work</Button>
                </ToggleGroupItem>
                <ToggleGroupItem value="Personal">
                  <Button className={`button-personal ${newEvent.type === "Personal" ? "clicked" : ""}`} variant="outline" onClick={() => setNewEvent({...newEvent, type:"Personal"})}>Personal</Button>
                </ToggleGroupItem>
                <ToggleGroupItem value="Other">
                  <Button className={`button-other ${newEvent.type === "Other" ? "clicked" : ""}`} variant="outline" onClick={() => setNewEvent({...newEvent, type:"Other"})}>Other</Button>
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <Button className="button-modal" onClick={handleAddOrEditEvent}>
                  {editingEventIndex !== null ? "Save Changes" : "Add Event"}
                </Button>
                <Button className="button-modal" variant="destructive" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="export-buttons" >
        <Button style={{margin: "15px"}} className="button-calendar" onClick={() => exportEvents("json")}>Export as JSON</Button>
        <Button className="button-calendar" onClick={() => exportEvents("csv")}>Export as CSV</Button>
      </div>
      </div>
    </div>
  );
};

export default App;