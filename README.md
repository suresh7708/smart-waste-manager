# Smart Waste Manager

Build an AI-Based Smart Waste Collection & Complaint Management System web app based on the attached presentation. Include:
1. Multi-role Authentication / Login page with quick role switchers for User (resident/student), Worker (collection staff), and Admin.
2. Complete Admin Dashboard matching Page 10 of the presentation:
   - Stat cards: Total (128), Pending (14), In Progress (22), Completed (76), Overdue (6)
   - Complaint management queue with AI-evaluated priority (High/Medium/Low), condition (Overflowing, Partially Filled, Normal), location, photos, deadlines, and assigned workers
   - Worker assignment modal and status lifecycle management (Pending -> Assigned -> In Progress -> Completed -> Verified)
   - Completion verification review (before and after photo comparison with Approve/Rework actions)
   - Smart Waste Hotspot Detection section highlighting recurring problem locations (e.g., Canteen, Hostel Block A, Library) and resolution time metrics
3. User portal tab to test submitting a waste complaint with photo preview, simulated AI condition & priority analysis, location selection, and complaint tracking.
4. Worker task view to see assigned tasks, start work, and submit completion proof photos.
Make the UI clean, modern, responsive, and intuitive with realistic mock data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/629a456f-ae0c-4e8f-a873-c5f34baa636d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
