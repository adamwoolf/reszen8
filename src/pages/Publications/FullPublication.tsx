import React, { useEffect, useState } from "react";
import { marked } from "marked";
import { useParams, Link } from "react-router-dom";
import { getFullPublication } from "../../contentful";
import { useAuth } from "../../contexts/AuthContext";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";

const FullPublication = () => {
  const { slug } = useParams();
  const [content, setContent] = useState({});
  const { addOrUpdate } = useFirebasedatabase("USERS");
  const { currentUser, setCurrentUser } = useAuth();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    getFullPublication(slug).then((data) => setContent(data?.items?.[0]));
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
      <button onClick={savePublication}>Save to my dashboard</button>
    );

  if (!title) return null;
  return (
    <div className='publication__full'>
      <h1>{title}</h1>
      <p>Published on {date.toDateString()}</p>
      {currentUser && showSaveUI()}
      <div className='publication__card-divider' />
      {body && <section dangerouslySetInnerHTML={{ __html: marked(body) }} />}
      <Link className='btn publication__full__back-cta ' to={"/publications"}>
        View all publications
      </Link>
    </div>
  );
};

export default FullPublication;
