import React from "react";
import AmbientEnv from "../../components/AmbientEnv/AmbientEnv";
import "./MeditationLibraryStyles.scss";

const ToggleContainer = ({ show }: { show: boolean }) => {
  return (
    <div
      className={`meditation-library__ia-select ${
        show ? "meditation-library__ia-select--show" : "meditation-library__ia-select--hide"
      }`}
    >
      <AmbientEnv />
    </div>
  );
};

export default ToggleContainer;
