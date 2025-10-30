import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import GreekNewsfeedApp from "./GreekNewsfeedApp"

const rootElement = document.getElementById("root")

if (!rootElement) {
  console.error("[v0] Root element not found. Make sure there is a <div id='root'></div> in your HTML.")
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GreekNewsfeedApp />
    </React.StrictMode>,
  )
}
