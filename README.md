# TaskForge – Smart To-Do List with Priority-Based Focus

**TaskForge** is a minimalist task management app built for individuals who want to manage their daily workload with clarity and smart prioritization. Designed for speed and usability, it helps users focus on what matters most.

## 🚀 Features

✅ **Email Authentication**  
Secure login with Supabase Auth – your data stays private and scoped to your account.

✅ **Task Management**  
Create, edit, and delete tasks with essential metadata:
- 📌 Title
- 📃 Description
- 📅 Due Date
- 📊 Weight (Importance: 1–5)

✅ **Priority Score Calculation**  
Tasks are scored based on a combination of urgency and importance.  
Formula: `Score = Weight / Days Until Due`  
Used to dynamically rank tasks in the list.

✅ **List View**  
- Tasks sorted by descending priority score.
- Clean and minimal interface for task focus.

✅ **Calendar View**  
Visualize task deadlines on a monthly calendar.

✅ **Daily Notifications**  
- In-app reminders for tasks due **today** or **tomorrow** via toast alerts.

## 🔧 Upcoming Features (Planned, Not Yet Implemented)
- [ ] Subtask Nesting (Hierarchical task breakdown)
- [ ] Google Calendar Integration

> These features are part of the future roadmap and are not yet available in the current version.

## 🛠 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth)
- **UI Library:** shadcn/ui

## 📦 Folder Structure (Simplified)

taskforge/
├── src/
│ ├── pages/
│ ├── components/
│ └── lib/
├── supabase/
└── tailwind.config.ts


## 📸 Live Demo  
🔗 [View the live app](https://nested-task-horizon-5imd.vercel.app/)

---

## 🧠 Inspiration  
Originally inspired by productivity systems like Eisenhower Matrix and Bullet Journal. TaskForge brings that clarity into a smart, simple, and elegant tool.

