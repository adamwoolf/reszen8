import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setLikes } from "../../store/contentSlice";
import { AWS_DB_ENDPOINT } from "../../constants";
import "./LikeCtaStyles.scss";

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
  const [likes, setLikes] = useState(item.likes || 0);
  const table =
    content === "publications"
      ? "Articles"
      : "meditations" && !item.staticMed
      ? "User_Bespoke_Meditations"
      : "Static_Meditations";

  if (!currentUser || !item?.uid) return null;

  const isFavourite =
    currentUser?.favourites?.publications?.includes(item.uid) ||
    currentUser?.favourites?.meditations?.includes(item.uid);

  // handles user data liked items
  const toggleFavourite = async (id: string) => {
    console.log(likes);

    const userFavs = currentUser?.favourites?.[content];
    if (!userFavs?.includes(item.uid)) {
      const numLikes = item.likes ? item.likes + 1 : 1;
      fetch(`${AWS_DB_ENDPOINT}/updateLike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: item.uid, likes: numLikes, table: table }),
      });
      // dispatch(setLikes({ uid: item.uid, likes: numLikes, content: table }));
    }
    // remove like
    if (userFavs?.includes(item.uid)) {
      if (item.likes > 0) {
        fetch(`${AWS_DB_ENDPOINT}/updateLike`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: item.uid, likes: item.likes - 1, table: table }),
        });
        // dispatch(setLikes({ uid: item.uid, likes: item.likes - 1, content: table }));
      }

      const updatedPubs = userFavs.filter((item) => item !== id);
      const newData = { ...currentUser, favourites: { ...currentUser?.favourites, [content]: updatedPubs } };
      updateUser(currentUser.uid, { favourites: { ...currentUser.favourites, [content]: updatedPubs } });
      setCurrentUser(newData);
      setLikes(likes - 1);
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
    setLikes(likes + 1);
  };
  return (
    <div style={{ top: large ? 32 : 12 }} className='likes'>
      <button onClick={() => toggleFavourite(id)} className='publication__heart-cta'>
        <FaHeart
          size={large ? 30 : 15}
          className={isFavourite ? "publication__heart publication__heart--favourite" : "publication--heart"}
        />
      </button>
      <span className='likes__count'>{likes.likes || likes} likes</span>
    </div>
  );
};

export default LikeCta;
