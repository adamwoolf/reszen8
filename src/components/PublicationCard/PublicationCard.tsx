import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../LikeCta/LikeCta";
import { Link } from "react-router-dom";
import { marked } from "marked";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";
import { categoriser } from "../../Util";
import Icon from "../Icon/Icon";

const PublicationCard = ({ item, showLike = true }) => {
  const { fields, sys, category } = item;
  const { currentUser, setCurrentUser } = useAuth();
  const { addOrUpdate } = useFirebasedatabase("USERS");
  const [saved, setSaved] = useState(false);
  function truncateTo25Words(text: string) {
    const words = text.trim().split(/\s+/); // split on any whitespace
    if (words.length <= 25) return text;
    return words.slice(0, 25).join(" ") + "…";
  }

  const truncatedBody = truncateTo25Words(fields.body);

  useEffect(() => {
    if (currentUser?.savedItems?.publications && sys) {
      const exists = !!currentUser?.savedItems?.publications?.find((pub) => pub.id === sys?.id);
      setSaved(exists);
    }
  }, [fields, sys, currentUser?.savedItems?.publications]);

  const savePublication = () => {
    const newData = {
      ...currentUser,
      savedItems: {
        ...currentUser?.savedItems,
        publications: currentUser?.savedItems?.publications
          ? [...currentUser?.savedItems?.publications, { ...fields, id: sys.id }]
          : [{ ...fields, id: sys.id }],
      },
    };
    addOrUpdate(currentUser?.firebaseId, newData);
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
    <article key={sys.id} className='feature-card clickable publication__card'>
      {showLike && currentUser && <LikeCta id={sys.id} />}

      <Link className='publication__card-content' to={`/publications/${fields.slug}`}>
        <div className='publication__card-inner'>
          <div className='publication__card-icon-container'>
            <Icon type={category[0].category} />
          </div>
          <h3 className='publication__card-title'>{fields.title}</h3>
          <div className='publication__card-divider' />
          <span dangerouslySetInnerHTML={{ __html: marked(truncatedBody) }} />
        </div>
        <span className='publication__card-readmore'> read more...</span>
      </Link>
      {currentUser && showSaveUI()}
    </article>
  );
};

export default PublicationCard;
