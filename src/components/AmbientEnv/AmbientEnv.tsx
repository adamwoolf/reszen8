import React, { useState, useEffect } from "react";
import rain from "../../assets/audio/rain.mp3";
import space from "../../assets/audio/space.mp3";
import ocean from "../../assets/audio/ocean.mp3";
import { useDispatch } from "react-redux";
import { setImmersiveEnv } from "../../store/contentSlice";
import "./AmbientEnvStyles.scss";
import { useSelector } from "react-redux";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";
import { trackCTA } from "../../utils/analytics";

const Envs = [
  { name: "Warm", url: space },

  { name: "Ocean", url: ocean },
  { name: "Rain", url: rain },
  { name: "None", url: "" },
];

const AmbientEnv = () => {
  const dispatch = useDispatch();
  const [envs, setEnvs] = useState<{ name: ""; url: "" }[]>();
  const selected = useSelector((state) => state.content.immersiveEnv);

  useEffect(() => {
    const savedImmersive = window.localStorage.getItem("immersive");

    const env = savedImmersive ? Envs.find((e) => e.name === savedImmersive) : Envs[0];

    dispatch(setImmersiveEnv(env));
  }, []);

  const handleChange = (e) => {
    const name = e.target.value;
    trackCTA(`Immersive Audio Change ${name}`);
    const en = Envs.find((e) => e.name === name);
    dispatch(setImmersiveEnv(en));
    window.localStorage.setItem("immersive", name);
    // if (en) setBackingUrl(en.url);
  };
  return (
    <div className='ambient'>
      <img className='ia-logo' src={immersiveLogo} />
      <select value={selected?.name} onChange={handleChange}>
        {Envs?.map((en) => (
          <option key={en.name} value={en.name}>
            {en.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AmbientEnv;
