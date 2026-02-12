import React, { useState, useEffect } from "react";
import Popup from "../Popup/Popup";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AudioController from "../AudioPlayer/AudioController";
import { useSelector } from "react-redux";
import { getStaticMeditations } from "../../store/contentSelectors";
import { Meditation } from "../../models";
import { FaTimesCircle } from "react-icons/fa";
import "./MeditationPopupStyles.scss";
import { useAuth as useAwsAuth } from "react-oidc-context";
import logo from "../../assets/logoNew.png";

const MeditationPopup = () => {
  const auth = useAwsAuth();
  const navigate = useNavigate();
  const { title } = useParams();
  const [signInPrompt, setSignInPrompt] = useState(false);
  const [selected, setSelected] = useState<Meditation | null>(null);
  const { currentUser } = useAuth();
  const staticMeds = useSelector(getStaticMeditations);
  const images = useSelector((state) => state.content.collectionImages);

  useEffect(() => {
    const parsedTitle = title?.replace(/_/g, " ");
    const selectedMed = staticMeds?.find((item) => item.title === parsedTitle);
    if (selectedMed?.collection) {
      const imgSrc = images.find((im) => im.collectionName === selectedMed.collection)?.image?.url;
      return setSelected({ ...selectedMed, image: imgSrc });
    }
    setSelected(selectedMed);

    if (!title) {
      setSelected(null);
    }
  }, [title, staticMeds]);

  const onSampleEnd = () => {
    setSignInPrompt(true);
  };

  return (
    <Popup
      fitContent
      maxWidth={450}
      showClose={false}
      show={!!selected}
      onClose={() => {
        navigate("/meditation-library");
        setSelected(null);
      }}
    >
      {selected && (
        <div className='med-popup'>
          <button
            onClick={() => {
              navigate("/meditation-library", { replace: true });

              setSelected(null);
            }}
            className='med-popup__close'
          >
            <FaTimesCircle />
          </button>
          {selected.collection && <img className='med-popup__logo' src={logo} />}
          {selected.image && <img className='med-popup__collection' src={selected.image} />}
          {selected.collection ? (
            <h3>{selected.collection}</h3>
          ) : (
            <div className='med-popup__logo-container'>
              <img className='med-popup__logo--main' src={logo} />
            </div>
          )}
          <h3>{selected.title}</h3>
          <div className='med-popup__bottom'>
            {!signInPrompt && (
              <AudioController
                onSampleEnd={onSampleEnd}
                playSample={!currentUser}
                isImmersive={selected.immersive}
                audioUrl={selected?.audioUrl}
              />
            )}
            {!currentUser && signInPrompt && (
              <div className='med-popup--fadein'>
                <p>To continue enjoying this, and other meditations, please login or sign up</p>
                <div className='med-popup__ctas'>
                  <button className='med-popup__cta' onClick={() => auth.signinRedirect()}>
                    Sign in
                  </button>
                  <Link className='med-popup__cta med-popup__cta--link' to='/memberships'>
                    Signup
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Popup>
  );
};

export default MeditationPopup;
