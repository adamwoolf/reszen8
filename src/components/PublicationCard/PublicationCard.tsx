import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../LikeCta/LikeCta";
import { Link } from "react-router-dom";
import { marked } from "marked";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";
import { categoriser } from "../../Util";
import Icon from "../Icon/Icon";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { FaAudible, FaFileAudio, FaSpeakap, FaSoundcloud, FaVolumeUp } from "react-icons/fa";

const PublicationCard = ({ item, showLike = true }) => {
  const { category } = item;
  const { currentUser, setCurrentUser, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  function truncateTo25Words(text: string) {
    const words = text.trim().split(/\s+/); // split on any whitespace
    if (words.length <= 25) return text;
    return words.slice(0, 25).join(" ") + "…";
  }

  const truncatedBody = truncateTo25Words(item.content);

  useEffect(() => {
    if (currentUser?.savedItems?.publications) {
      const exists = !!currentUser?.savedItems?.publications?.find((pub) => pub.id === item?.uid);
      setSaved(exists);
    }
  }, [currentUser?.savedItems?.publications]);

  const savePublication = () => {
    const newData = {
      ...currentUser,
      savedItems: {
        ...currentUser?.savedItems,
        publications: currentUser?.savedItems?.publications
          ? [...currentUser?.savedItems?.publications, { ...item, id: item.uid }]
          : [{ ...item, id: item.uid }],
      },
    };
    // addOrUpdate(currentUser?.firebaseId, newData);
    setCurrentUser(newData);
  };

  const showSaveUI = () =>
    saved ? (
      <span className='publication__card__added'>
        saved to <Link to='/dashboard'> My Dashboard</Link>
      </span>
    ) : (
      <button className='publication__card__add' onClick={savePublication}>
        save to My dashboard
      </button>
    );
  return (
    <article key={item.uid} className='feature-card clickable publication__card'>
      {showLike && currentUser && <LikeCta item={item} id={item.uid} />}

      <Link className='publication__card-content' to={`/articles/${item.title}`}>
        <div className='publication__card-inner'>
          <div className='publication__card-icon-container'>
            <Icon type={category[0].category} />
          </div>
          <h3 className='publication__card-title'>{item.title}</h3>
          {currentUser && item.audioFile && <FaVolumeUp color='orange' />}

          <div className='publication__card-divider' />
          <span dangerouslySetInnerHTML={{ __html: marked(truncatedBody) }} />
        </div>
        <span className='publication__card-readmore'> read more...</span>
        {/* {currentUser && fields.audioFile && <AudioPlayer audioUrl={fields.audioFile.fields.file.url} />} */}
      </Link>
      {currentUser && showSaveUI()}
    </article>
  );
};

export default PublicationCard;
