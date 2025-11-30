Pulse - Business Operating System

The intelligent operating system for your business.

Pulse is a modern, all-in-one CRM and Financial Dashboard designed to be the heartbeat of your daily operations. Unlike standard CRMs that just store data, Pulse is smart—it tracks your financial health, flags stale deals, and helps you focus on what matters most.

🚀 Features

🧠 Smart Dashboard

Morning Briefing: Get an instant read on your business health (Profitable vs. Burning Cash).

Urgent Tasks: Automatically surfaces overdue or due-today tasks.

Stale Deal Detection: Flags deals that haven't been updated in 7+ days.

Activity Feed: A unified timeline of notes and expenses linked to deals.

💼 Deal Pipeline

Kanban-ready Architecture: Manage deals through stages (Open, Negotiation, Pending, Won).

Inline Management: Add tasks and notes directly within the deal view.

Profitability Tracking: Track expenses per deal to calculate real Net Profit margins.

💰 Financial Pulse

Real-time P&L: Automatically calculates Net Profit (Won Revenue - Expenses).

Forecasting: Weighted revenue projections based on deal stages.

Expense Tracking: Log costs against deals or general overhead.

Visual Reports: Monthly performance charts and burn rate analysis.

📇 Contact Management

Seamless Profile: Edit contact details and manage tags without leaving the page.

History: View all related deals and tasks for every contact.

🛠️ Tech Stack

Framework: Next.js 15 (App Router)

Database: PostgreSQL (via Prisma ORM)

Authentication: Clerk

Styling: Tailwind CSS + DaisyUI

Deployment: Vercel

📦 Getting Started

Clone the repository:

git clone [https://github.com/yourusername/pulse-crm.git](https://github.com/yourusername/pulse-crm.git)
cd pulse-crm


Install dependencies:

npm install


Set up Environment Variables:
Create a .env file in the root directory and add the following keys:

# Database
DATABASE_URL="postgresql://user:password@host:port/db"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Image Uploads (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Optional: Google Integration
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GOOGLE_REDIRECT_URI=...


Initialize the Database:

npx prisma db push


Run the development server:

npm run dev


Open http://localhost:3000 with your browser to see the result.

🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

📄 License

This project is licensed under the MIT License.

Built by me • Powered by Gemini