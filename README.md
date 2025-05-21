# React-enStein

```
image to go here
```

## 📚 Table of Contents

- [About This Project](#-about-this-project)
- [Core Concepts](#-core-concepts)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Game Loop & Controls](#-game-loop--controls)
- [Rendering](#-rendering)
- [Constants & Tuning](#-constants--tuning)
- [Features](#-features-checklist-style)
- [How To Run](#-how-to-run)
- [Dev Notes](#-dev-notes)
- [Screenshots](#-screenshots-todo)
- [Credits](#-credits)
- [Future Plans](#-future-plans)

---

## 🚀 About This Project

Retro Wolfenstein 3D clone using 2D raycasting, a lot of math and a lot of caffeine, built using Vite + React.

---

## 🧠 Core Concepts

The game utilizes 2D [Raycasting Maths](https://lodev.org/cgtutor/raycasting.html) and a game loop created via [RequestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) as the core structure. As well as this we utilize [Delta Time](https://en.wikipedia.org/wiki/Delta_timing) for movement and [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) drawing and collision logic.

---

## 🗂 Project Structure

So far we have built the project out to looks like this, this will change in the future but for now we're working on tackling the core rendering of objects

```js
src / components / canvas / Canvas.jsx;
constants / gameConfig.js;
map.js;
playerConfig.js;
engine / renderer.js;
hooks / useCanvas.js;
useGameState.js;
useGameLoop.js;
utils / FrameLoop.js;
App.jsx;
main.jsx;
```

- **components/**: Reusable UI and game components (e.g., Canvas)
- **constants/**: Game constants (map, player, config)
- **engine/**: rendering and core raycasting / game control logic
- **hooks/**: Custom React hooks for game state, loops, and canvas
- **utils/**: Frame loop and other utilities
- **App.jsx**: Main entry point for the game logic and rendering

---

## 🛠 Tech Stack

- **React** (with hooks)
- **Vite** (for fast development)
- **JavaScript** (ES6+)
- **HTML5 Canvas** (for rendering)

---

## 🎮 Game Loop & Controls

- The game loop is powered by `requestAnimationFrame` and managed by a custom `useGameLoop` hook.
- **Delta time** is used for smooth, frame-rate-independent movement.

So far we have implemented basic movement controls, as the application progresses we will add the ability to interact and shoot, for this first iteration I wanted to get core movement and player positioning up and running

- **Keyboard controls**:
  - `W` / `ArrowUp` – Move forward
  - `S` / `ArrowDown` – Move backward
  - `A` / `ArrowLeft` – Rotate left
  - `D` / `ArrowRight` – Rotate right
- Input is handled via event listeners in a custom hook.

---

## 🖼 Rendering

- The game uses a `<canvas>` element for all rendering.
- The **minimap** and player are drawn using 2D Canvas APIs.
- The raycasting engine (in progress) will render a pseudo-3D view by casting rays from the player's position and drawing vertical wall slices based on distances.
- Rendering and game logic are decoupled for clarity and performance.

---

## ⚙️ Constants & Tuning

- All game parameters (map layout, tile size, player speed, FOV, etc.) are defined in `/constants/`.
- Easy to tweak for rapid prototyping and balancing.

---

## ✅ Features % To Do

- [x] Canvas-based rendering
- [x] Custom game loop with delta time
- [x] Keyboard controls for movement and rotation
- [x] Modular constants for easy tuning
- [x] Minimap rendering
- [ ] Raycasting engine for pseudo-3D view
- [ ] Collision detection
- [ ] Wall textures and sprites
- [ ] Enemies and pickups
- [ ] Sound effects and music

---

## ▶️ How To Run

1. **Install dependencies:**  
   npm install

2. **Start the development server:**  
   npm run dev

3. **Open your browser:**  
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

(Future iterations will be hosted via netlify)

---

## 📝 Dev Notes

- The game logic is decoupled from React’s render cycle for performance.
- All movement is frame-rate independent thanks to delta time.
- The codebase is modularized for easy expansion (add more features, maps, etc.).
- ESLint is used to enforce code quality and catch common bugs.
- For debugging, use `console.log` in key handlers or conditionally in game logic.

---

## 📸 Screenshots (TODO)

```
Screenshots will go here once I get rendering working
```

---

## 🙏 Credits

- [Lode's Computer Graphics Tutorial](https://lodev.org/cgtutor/raycasting.html) for raycasting math
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) for Canvas API references
- [Wolfenstein 3D](https://en.wikipedia.org/wiki/Wolfenstein_3D) for inspiration

---

## 🔮 Future Plans

- Complete the raycasting 3D renderer
- Add wall textures and sprite rendering
- Implement collision detection and enemy AI
- Add sound effects and music
- Level editor and custom maps
- Deploy as a playable web game

---
