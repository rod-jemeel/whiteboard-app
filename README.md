# Collaborative Whiteboard

A real-time collaborative drawing application built with Next.js, Supabase, and Konva.js. Draw, collaborate, and communicate with others in real-time.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)
![License](https://img.shields.io/badge/license-MIT-purple)

## ✨ Features

- 🎨 **Real-time Drawing** - Draw with multiple tools and see changes instantly
- 👥 **Live Collaboration** - See other users' cursors and drawings in real-time
- 💬 **Integrated Chat** - Communicate while drawing
- 🔗 **Easy Sharing** - Share whiteboards with 8-character invite codes
- 👤 **User Profiles** - Custom usernames and avatars
- 🎯 **Drawing Tools** - Pen, lines, rectangles, circles, and eraser
- 🎨 **Customization** - Color picker and stroke width controls
- ↩️ **Undo/Redo** - Full history support
- 📱 **Responsive** - Works on desktop and tablet devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS, CSS Modules
- **Canvas**: Konva.js, React-Konva
- **State**: Redux Toolkit, Redux Persist
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: Supabase Realtime (WebSockets)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whiteboard-app.git
cd whiteboard-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up the database:
   - Go to your Supabase SQL editor
   - Run the SQL files in `/docs` folder in order:
     - `01-create-tables.sql`
     - `02-enable-rls-simple.sql`
     - And any other numbered SQL files

6. Run the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
whiteboard-app/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── store/           # Redux store and slices
│   ├── lib/             # Utilities and Supabase client
│   └── types/           # TypeScript types
├── docs/                # SQL migrations and documentation
└── public/              # Static assets
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Enable Authentication (Email/Password)
3. Run the SQL migrations in `/docs`
4. Enable Realtime for tables: `drawings`, `presence`, `whiteboard_collaborators`
5. Create a storage bucket named `avatars` for profile pictures

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_APP_URL` - Your app URL (for redirects)

## 📱 Usage

1. **Sign Up/Login** - Create an account or login
2. **Create Whiteboard** - Click "Create New" from dashboard
3. **Invite Others** - Share the 8-character invite code
4. **Start Drawing** - Select tools and collaborate in real-time
5. **Chat** - Use the chat panel to communicate
6. **Manage** - Clear your drawings or entire canvas (owner only)

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linting
npm run lint
```

## 🐛 Troubleshooting

### Common Issues

1. **Drawing save errors**: Run `/docs/12-fix-drawing-types.sql`
2. **Invite code not working**: Run `/docs/14-simple-invite-system.sql`
3. **User signup errors**: Run `/docs/16-remove-user-trigger.sql`
4. **Real-time not working**: Enable Realtime on tables in Supabase

### Debug Pages

- `/debug` - Check database connection
- `/test-invite` - Test invite code system
- `/api-test` - Test Supabase queries

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Konva.js](https://konvajs.org/) - 2D canvas library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

Built with ❤️ using Next.js and Supabase