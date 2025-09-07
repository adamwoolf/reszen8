import React from "react";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";
import { useAuth } from "../../contexts/AuthContext";
import { FaHeart } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { setMeta, setStaticMeditations, setMeditations, setArticles, setLikes } from "../../store/contentSlice";
import { CONTENT_TYPES, AWS_DB_ENDPOINT } from "../../constants";
import {
  getMeditationLikes,
  getPublicationLikes,
  getMeta,
  getStaticMeditations,
  getMeditations,
} from "../../store/contentSelectors";
import "./LikeCtaStyles.scss";
import { getAWSArticles, getMeditationItemsREST, getStaticMeditationsREST } from "../../store/storeListener";

interface Like {
  id: string;
  likes: number;
}
const LikeCta = ({
  id,
  large = false,
  content = "publications",
  item,
}: {
  id: string;
  large?: boolean;
  content?: "meditations" | "publications";
  item: any;
}) => {
  const dispatch = useDispatch();
  const { currentUser, setCurrentUser, updateUser } = useAuth();
  const { addOrUpdate: addOrUpdateMeta } = useFirebasedatabase("meta");
  const data = useSelector(getMeta);
  const staticMeds = useSelector(getStaticMeditations);
  const bespokeMeds = useSelector(getMeditations);

  const table =
    content === "publications"
      ? "Articles"
      : "meditations" && !item.staticMed
      ? "Bespoke_Meditations"
      : "Static_Meditations";

  if (!currentUser || !item?.uid) return null;

  const isFavourite =
    currentUser?.favourites?.publications?.includes(item.uid) ||
    currentUser?.favourites?.meditations?.includes(item.uid);

  // handles user data liked items
  const toggleFavourite = async (id: string) => {
    const userFavs = currentUser?.favourites?.[content];
    if (!userFavs?.includes(item.uid)) {
      const numLikes = item.likes ? item.likes + 1 : 1;
      fetch(`${AWS_DB_ENDPOINT}/updateLike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: item.uid, likes: numLikes, table: table }),
      });
      dispatch(setLikes({ uid: item.uid, likes: numLikes, content: table }));
    }
    // remove like
    if (userFavs?.includes(item.uid)) {
      if (item.likes > 0) {
        fetch(`${AWS_DB_ENDPOINT}/updateLike`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: item.uid, likes: item.likes - 1, table: table }),
        });
        dispatch(setLikes({ uid: item.uid, likes: item.likes - 1, content: table }));
      }

      const updatedPubs = userFavs.filter((item) => item !== id);
      const newData = { ...currentUser, favourites: { ...currentUser?.favourites, [content]: updatedPubs } };
      updateUser(currentUser.uid, { favourites: { ...currentUser.favourites, [content]: updatedPubs } });
      setCurrentUser(newData);

      return;
    }

    const newData = {
      ...currentUser,
      favourites: {
        ...currentUser?.favourites,
        [content]: currentUser?.favourites?.[content] ? [...currentUser.favourites[content]!, id] : [id],
      },
    };

    const newLikes = currentUser?.favourites?.[content] ? [...currentUser.favourites[content]!, id] : [id];

    updateUser(currentUser.uid, { favourites: { ...currentUser.favourites, [content]: newLikes } });

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
      <span className='likes__count'>{item.likes ? item.likes : 0} likes</span>
    </div>
  );
};

export default LikeCta;
