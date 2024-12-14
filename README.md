# Personal Calendar

## Instructions to Run the Application

### Steps:
1. Navigate to the project directory `./shadcn-calendar`.
2. Execute the following commands based on your requirements:
   - **For Development:** `npm run dev`
   - **For Build:** `npm run build`
   - **For Deployment:** `vercel`

### Code Structure:
- `src/assets/App.css`: Contains CSS styling for App.
- `src/assets/App.jsx`: Contains required components and functions for the calendar.
- `./index.html`: Main webpage, title was added here.
- `@/_/components/ui`: Contains shadcn components used

## General Information

- The project is built using the **Vite framework** to enable **Tailwind CSS** and **ShadCN components**.
- ShadCN components have been utilized for:
  - Buttons
  - Dialog
  - Input fields
  - Textarea
  - Toggle options
  - General CSS styling
- The project has been deployed on **Vercel**.  
  **Deployment Link:** [ShadCN Calendar](https://shadcn-calendar-mnrsj5pha-rojas-projects-2dda8150.vercel.app/)  

## Calendar Features

### Calendar Grid:
- Days are aligned and calendar logic has been implemented from scratch.
- Navigation between months is possible using **Previous/Next** buttons.
- Visual indicators:
  - **Weekdays:** Grey
  - **Weekends:** Light blue
  - **Today:** Orange
  - **Selected Day:** Purple
- **Bonus Feature:** Users can export the event list for a specific month in **JSON/CSV** format.

### Event Management:
- **Adding Events:**
  - Clicking on a day opens a modal.
  - Modal displays a list of existing events for the selected day with options to **edit/delete** them.
  - Users can add new events by filling out the following fields:
    - Name
    - Start Time
    - End Time
    - Optional Description
    - Optional Type
  - **Validation:** 
    - Overlapping events are prevented.
    - End time must be later than the start time (alerts are used for validation errors).
  - The modal closes automatically if clicked outside its boundaries.

- **Search Events by Keyword**:
    - Users can search for an event with keywords related to name, description and type for a day.
  
- **Event Persistence:**
  - Event data is stored in **localStorage**, ensuring persistence.

- **Calendar Indicators:**
  - Days with events are marked with a **red dot**.

- **Bonus: Event Types:**
  - A toggle component allows users to select the event type (Work/Personal/Other). Only one type can be selected at a time.
  - Event types are **color-coded** for better visibility.

---