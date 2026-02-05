import React, { useEffect, useState, useRef, useMemo } from "react";
import { AWS_DB_ENDPOINT } from "../../constants";
import Vimeo from "../../components/Vimeo/Vimeo";
import Player from "@vimeo/player";
import "./InsightsStyles.scss";
import LoadingScene from "../../components/LoadingScene/LoadingScene";

const Insights = () => {
  const [vids, setVids] = useState([]);
  const [loading, setLoading] = useState(false);
  const getVideos = async () => {
    setLoading(true);
    const res = await fetch(`${AWS_DB_ENDPOINT}/getVimeos`);
    const json = await res.json();
    setVids(json?.data);
    setLoading(false);
  };

  useEffect(() => {
    getVideos();
  }, []);

  if (loading) return <LoadingScene />;

  return (
    <div className='insights-grid'>
      <VimeoGallery videos={vids} />
    </div>
  );
};

export default Insights;

const VimeoGallery = ({ videos }: { videos: any[] }) => {
  const playersRef = useRef({}); // store Player instances by video id
  const [playingVideo, setPlayingVideo] = useState(null); // currently playing video id
  const [activeVid, setActiveVid] = useState("");
  const handlePlay = (id) => {
    // Pause the previously playing video
    if (playingVideo && playingVideo !== id && playersRef.current[playingVideo]) {
      playersRef.current[playingVideo].pause();
    }
    setPlayingVideo(id);
  };

  function shuffleExceptFirst(array: any[]) {
    if (!array || !array.length) return [];
    if (array?.length <= 1) return array;

    const [first, ...rest] = array;

    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    // return array;
    return [first, ...rest];
  }

  const shuffledVideos = React.useMemo(() => {
    return shuffleExceptFirst(videos);
  }, [videos]);

  return (
    <>
      {shuffledVideos.map((video) => {
        const thumbnailUrl = video.pictures?.sizes?.at(-1)?.link || video.pictures?.base_link;

        const id = video.uri.split("/")[2];
        return (
          <div key={id} className='video-wrapper'>
            <iframe
              ref={(el) => {
                if (el && !playersRef.current[id]) {
                  playersRef.current[id] = new Player(el);

                  // Listen for the play event
                  playersRef.current[id].on("play", () => handlePlay(id));
                }
              }}
              src={`${video.player_embed_url}?api=1&byline=0&portrait=0`}
              width='400'
              height='400'
              frameBorder='0'
              allow='autoplay; fullscreen; picture-in-picture'
              allowFullScreen
            ></iframe>
          </div>
        );
      })}
    </>
  );
};
