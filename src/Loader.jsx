import React from "react"
import "./Loader.css"

function Loader({text}){
  return <div className="lds-container">
     <div className="lds-dual-ring" ></div>
    <h3>{text}</h3>
  </div>
}

export default Loader