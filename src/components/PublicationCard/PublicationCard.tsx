import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../../pages/Publications/LikeCta";
import { Link } from "react-router-dom";
import { marked } from "marked";

const PublicationCard = ({ fields, sys, showLike = true }) => {
  const { currentUser, setCurrentUser } = useAuth();

  function truncateTo25Words(text: string) {
    const words = text.trim().split(/\s+/); // split on any whitespace
    if (words.length <= 25) return text;
    return words.slice(0, 25).join(" ") + "…";
  }

  const truncatedBody = truncateTo25Words(fields.body);
  const isSaved = !!currentUser?.savedItems?.publications?.find((p) => p.id === sys.id);
  return (
    <article key={sys.id} className='feature-card clickable publication__card'>
      {showLike && currentUser && <LikeCta id={sys.id} />}

      <Link className='publication__card-content' to={`/publications/${fields.slug}`}>
        <div>
          <h3 className='publication__card-title'>{fields.title}</h3>
          {isSaved && <p className='publication__card-saved'>Saved to my dashboard</p>}
          <div className='publication__card-divider' />
          <span dangerouslySetInnerHTML={{ __html: marked(truncatedBody) }} />
        </div>
        <span className='publication__card-readmore'> read more...</span>
      </Link>
    </article>
  );
};

export default PublicationCard;
