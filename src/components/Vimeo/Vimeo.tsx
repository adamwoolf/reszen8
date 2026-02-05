import React from "react";
import "./VimeoStyles.scss";

const Vimeo = ({ id }: { id: string }) => {
  return (
    <iframe
      className='grid-vid'
      src={id}
      frameBorder='0'
      allow='autoplay; fullscreen; picture-in-picture'
      allowFullScreen
      title='Vimeo Video'
      width={300}
      height={300}
    ></iframe>
  );
};

export default Vimeo;
