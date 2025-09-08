import React, { useState } from "react";
import warm from "../../assets/audio/elec.m4a";
import rain from "../../assets/audio/rain.mp3";
import space from "../../assets/audio/space.mp3";
import ocean from "../../assets/audio/ocean.mp3";
import { useDispatch } from "react-redux";
import { setAmbientEnv } from "../../store/contentSlice";
import "./AmbientEnvStyles.scss";
import { useSelector } from "react-redux";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";

const Envs = [
  { name: "None", url: "" },
  { name: "Ocean", url: ocean },
  { name: "Rain", url: rain },
  { name: "Warm", url: space },
];

const AmbientEnv = () => {
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.content.ambientEnv);

  const handleChange = (e) => {
    const name = e.target.value;
    const env = Envs.find((e) => e.name === name);
    dispatch(setAmbientEnv(env));
  };
  return (
    <div className='ambient'>
      <img className='ia-logo' src={immersiveLogo} />
      <select value={selected?.name} onChange={handleChange}>
        {Envs.map((en) => (
          <option value={en.name}>{en.name}</option>
        ))}
      </select>
    </div>
  );
};

export default AmbientEnv;
