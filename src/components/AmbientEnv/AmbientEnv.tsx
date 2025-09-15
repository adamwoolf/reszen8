import React, { useState, useEffect } from "react";
import warm from "../../assets/audio/elec.m4a";
import rain from "../../assets/audio/rain.mp3";
import space from "../../assets/audio/space.mp3";
import ocean from "../../assets/audio/ocean.mp3";
import { useDispatch } from "react-redux";
import { setImmersiveEnv } from "../../store/contentSlice";
import "./AmbientEnvStyles.scss";
import { useSelector } from "react-redux";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";
import { getImmersiveTracks } from "../../contentful";
import { usePlayer } from "../../contexts/AudioContext";

const Envs = [
  { name: "None", url: "" },
  { name: "Ocean", url: ocean },
  { name: "Rain", url: rain },
  { name: "Warm", url: space },
];

const AmbientEnv = () => {
  const dispatch = useDispatch();
  const [envs, setEnvs] = useState<{ name: ""; url: "" }[]>();
  const selected = useSelector((state) => state.content.immersiveEnv);
  const { currentAudio, playing, play, pause, seek, setBackingUrl, duration: contextDuration } = usePlayer();

  useEffect(() => {
    getImmersiveTracks().then((data) => {
      const newData = data.items.map((item) => ({
        name: item?.fields.name,
        url: item?.fields.track.fields.file.url,
      }));
      setEnvs(newData);
      // dispatch(setImmersiveEnv(newData[0]));
      setBackingUrl(newData[0].url);
    });
  }, []);

  const handleChange = (e) => {
    const name = e.target.value;
    const en = envs.find((e) => e.name === name);
    // dispatch(setImmersiveEnv(en));
    if (en) setBackingUrl(en.url);
  };
  return (
    <div className='ambient'>
      <img className='ia-logo' src={immersiveLogo} />
      <select value={selected?.name} onChange={handleChange}>
        {envs?.map((en) => (
          <option key={en.name} value={en.name}>
            {en.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AmbientEnv;
