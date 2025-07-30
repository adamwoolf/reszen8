import React, { useEffect, useState } from "react";
import { marked } from "marked";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";
import LikeCta from "./LikeCta";
import SocialShare from "../../components/SocialShare/SocialShare";
import { useContentStore } from "../../store/contentStore";

const FullPublication = () => {
  const { slug } = useParams();
  const [content, setContent] = useState({});
  const { addOrUpdate } = useFirebasedatabase("USERS");
  const { currentUser, setCurrentUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const { publications } = useContentStore();

  useEffect(() => {
    setContent(publications.find((pub) => pub.fields.slug === slug));
  }, [slug]);

  useEffect(() => {
    if (currentUser?.savedItems?.publications && content?.sys) {
      const exists = !!currentUser?.savedItems?.publications.find((pub) => pub.id === content?.sys?.id);
      setSaved(exists);
    }
  }, [content, currentUser?.savedItems?.publications, slug]);

  const { body, publishDate, title } = content?.fields || {};
  const date = publishDate ? new Date(publishDate) : new Date();

  const savePublication = () => {
    const newData = {
      ...currentUser,
      savedItems: {
        ...currentUser?.savedItems,
        publications: currentUser?.savedItems?.publications
          ? [...currentUser?.savedItems?.publications, { ...content?.fields, id: content.sys.id }]
          : [{ ...content?.fields, id: content.sys.id }],
      },
    };
    addOrUpdate(currentUser?.firebaseId, newData);
    setCurrentUser(newData);
  };

  const showSaveUI = () =>
    saved ? (
      <span className='publication__full__added'>
        Saved to <Link to='/dashboard'> my Dashboard</Link>
      </span>
    ) : (
      <button className='publication__full__add' onClick={savePublication}>
        Save to my dashboard
      </button>
    );

  if (!title) return null;
  return (
    <div className='publication__full'>
      <LikeCta large id={content?.sys?.id} />
      <h1 className='publication__title'>{title}</h1>
      {currentUser && showSaveUI()}
      <div className='publication__card-divider' />
      {body && <section dangerouslySetInnerHTML={{ __html: marked(body) }} />}
      <SocialShare title={title} quote={title} />
      <Link className='btn publication__full__back-cta ' to={"/publications"}>
        View all publications
      </Link>
    </div>
  );
};

export default FullPublication;
