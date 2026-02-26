import React from "react";
import logo from "../../assets/logoNew.png";
import { FaSync } from "react-icons/fa";
import AudioController from "../../components/AudioPlayer/AudioController";
import { useSelector } from "react-redux";

import "./Playlist.scss";

const CreateMeditationPlaylist = ({ flip, flipped }: { flipped: boolean; flip: () => void }) => {
  const meds = useSelector((state) => state.content.meditations);

  if (!meds.length) return null;
  return (
    <div className='playlist'>
      <img className='playlist__logo' src={logo} />

      <button className='playlist__flip-cta' onClick={flip}>
        <FaSync />
      </button>
      <h3>Your Meditations</h3>
      <ul className={flipped ? "playlist__list" : "playlist__list playlist__list--locked"}>
        {[...meds]
          .sort((a, b) => new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime())
          ?.map((med) => {
            const date = new Date(med.createdAt);
            const today = new Date();

            const isSameDay = (d1, d2) => {
              return (
                d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate()
              );
            };

            return (
              <li key={med.createdAt} className='playlist__list-item-outer'>
                <div className='playlist__list-item'>
                  <div>
                    <span
                      className={
                        isSameDay(date, today)
                          ? "playlist__list-item-title playlist__list-item-title--today"
                          : "playlist__list-item-title"
                      }
                    >
                      {med.title}
                    </span>
                    <span
                      className={
                        !isSameDay(date, today)
                          ? "playlist__list-item-type"
                          : "playlist__list-item-type playlist__list-item-type--today"
                      }
                    >
                      {med.meditationType}
                    </span>
                  </div>

                  <div className='playlist__list-item-inner'>
                    <span
                      className={
                        !isSameDay(date, today)
                          ? "playlist__list-item-date"
                          : "playlist__list-item-date playlist__list-item-date--today"
                      }
                    >
                      {isSameDay(date, today) ? "Today" : date.toDateString()}
                    </span>
                    <AudioController audioUrl={med.audioUrl} isImmersive={med.immersive} small />
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default CreateMeditationPlaylist;
