import React from "react";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";
import { useAuth } from "../../contexts/AuthContext";
import { FaHeart } from "react-icons/fa";

interface Like {
  id: string;
  likes: number;
}
const LikeCta = ({ id, large = false }: { id: string; large?: boolean }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const { addOrUpdate } = useFirebasedatabase("USERS");
  const { data, addOrUpdate: addOrUpdateMeta } = useFirebasedatabase("meta");
  const numLikes = data?.LIKES?.find((like: Like) => like.id === id)?.likes || 0;

  if (!currentUser) return null;
  const isFavourite = currentUser?.favourites?.publications?.includes(id);

  const handleLikeClick = (id: string) => {
    if (!data?.LIKES?.map((item: Like) => item.id).includes(id)) {
      addOrUpdateMeta("LIKES", [...data?.LIKES, { id, likes: 1 }]);
      return;
    }
    const likes = data?.LIKES?.map((like: Like) => {
      if (like.id !== id) return like;
      return { ...like, likes: like.likes + 1 };
    });

    addOrUpdateMeta("LIKES", likes);
  };

  const removeLike = (id: string) => {
    const likes = data?.LIKES?.map((like: Like) => {
      if (like.id !== id) return like;
      return { ...like, likes: like.likes - 1 };
    });
    addOrUpdateMeta("LIKES", likes);
  };

  const toggleFavourite = (id: string) => {
    const userFavs = currentUser?.favourites?.publications;
    // remove like
    if (userFavs?.includes(id)) {
      removeLike(id);
      const updatedPubs = userFavs.filter((item) => item !== id);
      const newData = { ...currentUser, favourites: { ...currentUser?.favourites, publications: updatedPubs } };
      setCurrentUser(newData);
      addOrUpdate(currentUser.firebaseId, newData);
      return;
    }
    // add like
    handleLikeClick(id);

    const newData = currentUser?.favourites?.publications
      ? {
          ...currentUser,
          favourites: { ...currentUser.favourites, publications: [...currentUser?.favourites?.publications, id] },
        }
      : { ...currentUser, favourites: { ...currentUser?.favourites, publications: [id] } };
    addOrUpdate(currentUser.firebaseId, newData);
    setCurrentUser(newData);
  };
  return (
    <div className='likes'>
      <button onClick={() => toggleFavourite(id)} className='publication__heart-cta'>
        <FaHeart
          size={large ? 30 : 15}
          className={isFavourite ? "publication__heart publication__heart--favourite" : "publication--heart"}
        />
      </button>
      <span className='likes__count'>{numLikes} likes</span>
    </div>
  );
};

export default LikeCta;
