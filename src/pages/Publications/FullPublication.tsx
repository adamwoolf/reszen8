import React, { useEffect, useState } from "react";
import { marked } from "marked";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../../components/LikeCta/LikeCta";
import SocialShare from "../../components/SocialShare/SocialShare";
import { useSelector } from "react-redux";
import Icon from "../../components/Icon/Icon";
import { categoriser } from "../../Util";
import { Publication } from "../../models";
import AudioPlayer from "../../components/AudioPlayer/AudioController";

const FullPublication = () => {
  const { slug } = useParams();
  const [content, setContent] = useState({});
  const { updateUser } = useAuth();
  const { currentUser, setCurrentUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const publications = useSelector((state) => state.content.publications);

  useEffect(() => {
    setContent(publications?.find((pub: Publication) => pub.title.includes(slug)));
  }, [slug, publications]);

  useEffect(() => {
    if (currentUser?.savedItems?.publications) {
      const exists = !!currentUser?.savedItems?.publications?.find((pub: any) => pub.id === content?.uid);
      setSaved(exists);
    }
  }, [content, currentUser?.savedItems?.publications, slug]);

  const { content: body, title } = content || {};

  const savePublication = () => {
    const newPubs = {
      ...currentUser?.savedItems,
      publications: currentUser?.savedItems?.publications
        ? [...currentUser?.savedItems?.publications, { ...content, id: content.uid }]
        : [{ ...content, id: content.uid }],
    };
    const newData = {
      ...currentUser,
      savedItems: newPubs,
    };
    if (currentUser) updateUser(currentUser?.uid, { savedItems: newPubs });

    setCurrentUser(newData);
  };

  const showSaveUI = () =>
    saved ? (
      <span className='publication__full__added'>
        Saved to <Link to='/journey'> My Journey</Link>
      </span>
    ) : (
      <button className='publication__full__add' onClick={savePublication}>
        Save to MJourneyy Journey
      </button>
    );

  const category = categoriser(`${title}-${body}`);

  if (!title) return null;
  return (
    <div className='publication__full'>
      <h1 className='publication__title'>{title}</h1>

      {currentUser && showSaveUI()}
      <div className='publication__card-divider' />
      <LikeCta large id={content.uid} item={content} />

      <div className='publication__audio'>
        <AudioPlayer audioUrl={content.audioUrl} />
      </div>

      {body && <section dangerouslySetInnerHTML={{ __html: marked(body) }} />}
      <SocialShare title={title} quote={title} />
      {currentUser && (
        <Link className='btn publication__full__back-cta ' to={"/articles"}>
          View all articles
        </Link>
      )}
    </div>
  );
};

export default FullPublication;
