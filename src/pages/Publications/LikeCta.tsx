import React from "react";
import useFirebasedatabase from "../../hooks/useFirestoreCollection";
import { useAuth } from "../../contexts/AuthContext";
import { FaHeart } from "react-icons/fa";
const LikeCta = ({ id, large = false }: { id: string; large?: boolean }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const { addOrUpdate } = useFirebasedatabase("USERS");
  if (!currentUser) return null;
  const isFavourite = currentUser?.favourites?.publications?.includes(id);

  const toggleFavourite = (id: string) => {
    const userFavs = currentUser?.favourites?.publications;
    if (userFavs?.includes(id)) {
      const updatedPubs = userFavs.filter((item) => item !== id);
      const newData = { ...currentUser, favourites: { ...currentUser?.favourites, publications: updatedPubs } };
      setCurrentUser(newData);
      addOrUpdate(currentUser.firebaseId, newData);
      return;
    }
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
    <button onClick={() => toggleFavourite(id)} className='publication__heart-cta'>
      <FaHeart
        size={large ? 30 : 15}
        className={isFavourite ? "publication__heart publication__heart--favourite" : "publication--heart"}
      />
    </button>
  );
};

export default LikeCta;
