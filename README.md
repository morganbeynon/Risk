# Risk - COMP390 Dissertation Project
## Tech Stack
- **React** - UI framework
- **React Router** - Client-side navigation
- **Vite** - Frontend build tool / dev server
- **Socket.IO** - Real-time client-server communication
- **Node.js** - Server runtime
- **Vitest** - Unit testing

## Third-Party Libraries
| Library | Version | Purpose |
|---|---|---|
| socket.io | "^4.8.3" | WebSocket server |
| socket.io-client | "^4.8.3" | WebSocket client |
| react | "^19.2.4" | UI framework |
| react-router-dom | "^7.13.0" | Screen navigation |
| vite | "^7.1.7" | Build tool |
| vitest | "^4.1.5" | Unit testing |

## Project Structure
- `risk-game/` - Game engine, map generation, AI bot (no external dependencies)
- `risk-server/` - Node.js server
- `risk-ui/` - React frontend

## Running the Project
### Server
cd risk-server
npm install
node server.js

### Client
cd risk-ui
npm install
npm run dev