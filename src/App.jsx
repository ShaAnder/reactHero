import "./App.css";

import { useState } from "react";
import { useFrameLoop } from "./utils/FrameLoop";

function App() {
  const [time, setTime] = useState(0);
  const [deltaTime, setDeltaTime] = useState(0);
  const [color, setColor] = useState("");

  let nextColor = -1;
  useFrameLoop((time, deltaTime) => {
    // logic

    if (time > nextColor) {
      nextColor = time + 2000;

      //https://dev.to/akhil_001/generating-random-color-with-single-line-of-js-code-fhj
      setColor("#" + Math.floor(Math.random() * 16777215).toString(16));
    }
    setTime(time);
    setDeltaTime(deltaTime);
  });
  return (
    <>
      <div className="App">
        <header className="App-Header" style={{ background: color }}>
          <div>Reactenstein</div>
          <p>Time:</p>
          <p>{time}</p>
          <p>DeltaTime:</p>
          <p>{deltaTime}</p>
        </header>
      </div>
    </>
  );
}

export default App;
