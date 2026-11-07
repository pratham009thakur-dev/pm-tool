# Enterprise Project Management Suite (MERN)
> Production-grade full-stack MERN Project Management Suite.

A full-stack, production-grade project management application designed with a decoupled architecture (Node.js/Express REST backend + React/Vite/Tailwind frontend) powered by MongoDB Atlas.

---

## Core Capabilities
1. **Strict Role-Based Access Control**: Granular permissions differentiating `Project Owner`, `Project Admin`, and `Team Member`.
2. **Interactive Drag-and-Drop Kanban Board**: Real-time status shifts across 5 discrete workflow stages with optimistic UI updates and instant MongoDB persistence.
3. **Advanced Gantt Timeline Roadmap**: Scale across daily, weekly, and monthly horizons with task boundaries and overdue indicators.
4. **Data-Driven Analytics**: Native MongoDB `$aggregate` pipelines rendering task distribution, completion velocity, and member workload via Recharts.
5. **Team Collaboration**: Task-level discussions, role assignments, and project audit trails.

---

## Local Setup & Development

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB Atlas cluster URI

### 2. Backend Configuration
```bash
cd server
npm install
cp .env.example .env