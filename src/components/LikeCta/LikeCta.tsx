import React from "react";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";
import { useAuth } from "../../contexts/AuthContext";
import { FaHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { setMeta } from "../../store/contentSlice";
import { CONTENT_TYPES } from "../../constants";
import { getMeditationLikes, getPublicationLikes, getMeta } from "../../store/contentSelectors";
import "./LikeCtaStyles.scss";

interface Like {
  id: string;
  likes: number;
}
const LikeCta = ({
  id,
  large = false,
  content = "publications",
}: {
  id: string;
  large?: boolean;
  content?: "meditations" | "publications";
}) => {
  const dispatch = useDispatch();
  const { currentUser, setCurrentUser } = useAuth();
  const { addOrUpdate } = useFirebasedatabase("USERS");
  const { addOrUpdate: addOrUpdateMeta } = useFirebasedatabase("meta");
  const data = useSelector(getMeta);
  const medLikes = useSelector(getMeditationLikes);
  const pubLikes = useSelector(getPublicationLikes);

  const numPublicationLikes = pubLikes?.find((like: Like) => like.id === id)?.likes || 0;
  const numMeditationLikes = medLikes?.find((like: Like) => like.id === id)?.likes || 0;
  const numLikes = content === CONTENT_TYPES.publications ? numPublicationLikes : numMeditationLikes;

  if (!currentUser) return null;

  const isFavourite =
    currentUser?.favourites?.publications?.includes(id) || currentUser?.favourites?.meditations?.includes(id);

  // handles global likes for item
  const handleLikeClick = (id: string) => {
    if (content === CONTENT_TYPES.publications) {
      if (!data?.LIKES?.map((item: Like) => item.id).includes(id)) {
        addOrUpdateMeta("LIKES", [...data?.LIKES, { id, likes: 1 }]);
        dispatch(setMeta({ ...data, LIKES: [...data.LIKES, { id, likes: 1 }] }));
        return;
      }
      const likes = data?.LIKES?.map((like: Like) => {
        if (like.id !== id) return like;
        return { ...like, likes: like.likes + 1 };
      });

      addOrUpdateMeta("LIKES", likes);
      dispatch(setMeta({ ...data, LIKES: likes }));
    } else {
      if (!data?.meditationLIKES?.map((item: Like) => item.id).includes(id)) {
        const newData = data?.meditationLIKES ? [...data?.meditationLIKES, { id, likes: 1 }] : [{ id, likes: 1 }];
        addOrUpdateMeta("meditationLIKES", newData);
        dispatch(setMeta({ ...data, meditationLIKES: newData }));

        return;
      }
      const likes = data?.meditationLIKES?.map((like: Like) => {
        if (like.id !== id) return like;
        return { ...like, likes: like.likes + 1 };
      });
      addOrUpdateMeta("meditationLIKES", likes);
      dispatch(setMeta({ ...data, meditationLIKES: likes }));
    }
  };

  const removeLike = (id: string) => {
    if (content === CONTENT_TYPES.publications) {
      const likes = data?.LIKES?.map((like: Like) => {
        if (like.id !== id) return like;
        return { ...like, likes: like.likes - 1 };
      });
      addOrUpdateMeta("LIKES", likes);
      dispatch(setMeta({ ...data, LIKES: likes }));
    } else {
      const likes = data?.meditationLIKES?.map((like: Like) => {
        if (like.id !== id) return like;
        if (like.likes === 0) return like;
        return { ...like, likes: like.likes - 1 };
      });
      addOrUpdateMeta("meditationLIKES", likes);
      dispatch(setMeta({ ...data, meditationLIKES: likes }));
    }
  };

  // handles user data liked items
  const toggleFavourite = (id: string) => {
    const userFavs = currentUser?.favourites?.[content];
    // remove like
    if (userFavs?.includes(id)) {
      removeLike(id);
      const updatedPubs = userFavs.filter((item) => item !== id);
      const newData = { ...currentUser, favourites: { ...currentUser?.favourites, [content]: updatedPubs } };
      setCurrentUser(newData);
      addOrUpdate(currentUser.firebaseId, newData);
      return;
    }
    // add like
    handleLikeClick(id);

    const newData = {
      ...currentUser,
      favourites: {
        ...currentUser?.favourites,
        [content]: currentUser?.favourites?.[content] ? [...currentUser.favourites[content]!, id] : [id],
      },
    };

    addOrUpdate(currentUser.firebaseId, newData);

    setCurrentUser(newData);
  };

  return (
    <div className='likes'>
      <button onClick={() => toggleFavourite(id)} className='publication__heart-cta'>
        <FaHeart
          size={large ? 30 : 15}
          className={
            isFavourite && numLikes ? "publication__heart publication__heart--favourite" : "publication--heart"
          }
        />
      </button>
      <span className='likes__count'>{numLikes} likes</span>
    </div>
  );
};

export default LikeCta;
