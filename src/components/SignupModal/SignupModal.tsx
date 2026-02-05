import React, { useState, useEffect } from "react";
import Popup from "../Popup/Popup";
import NewUserPlanPurchaseCta from "../../pages/Memberships/NewUserPlanPurchaseCta";
import "./SignupModalStyles.scss";
import logo from "../../assets/logoNew.png";
import { AiFillCloseCircle } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { setShowSignupModal } from "../../store/contentSlice";
import { Link } from "react-router-dom";

const SignupModal = () => {
  const [show, setShow] = useState(true);
  const showModal = useSelector((state) => state.content.showSignupModal);
  const dispatch = useDispatch();

  return (
    <Popup
      fitContent
      show={showModal}
      onClose={() => dispatch(setShowSignupModal(false))}
      showClose={false}
      maxWidth={500}
      children={
        <div className='signup-modal-prompt'>
          <button className='signup-modal-prompt__close' onClick={() => dispatch(setShowSignupModal(false))}>
            <AiFillCloseCircle />
          </button>
          <img className='signup-modal-prompt__logo' src={logo} />
          <h3>Continue this practice with membership</h3>
          <span className='signup-modal-prompt__subtitle'>Access all content and build your personal journey.</span>
          {/* <NewUserPlanPurchaseCta label='Sign Up for 99p' homepage /> */}
          <Link
            className='signup-modal-prompt__cta'
            onClick={() => dispatch(setShowSignupModal(false))}
            to='/memberships'
          >
            Join Now
          </Link>
        </div>
      }
    />
  );
};

export default SignupModal;
