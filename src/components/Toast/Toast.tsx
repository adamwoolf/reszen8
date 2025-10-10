import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { deleteToast } from "../../store/contentSlice";
import { AiFillCloseCircle } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import { MdError, MdInfo } from "react-icons/md";

const Toast = ({ toast }) => {
  const dispatch = useDispatch();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLeaving(true);
    }, 6000);
  }, []);

  const handleAnimationEnd = () => {
    if (leaving) dispatch(deleteToast(toast));
  };
  const icon =
    toast.type === "success" ? (
      <FaCheckCircle size={17} color='green' />
    ) : toast.type === "info" ? (
      <MdInfo size={20} />
    ) : (
      <MdError color='red' size={20} />
    );
  return (
    <div onAnimationEnd={handleAnimationEnd} className={!leaving ? "message" : "message message--leaving"}>
      <span className='message__icon'>{icon}</span>
      <span className='message__text'>{toast.text}</span>{" "}
      <button onClick={() => setLeaving(true)} className='message__close'>
        <AiFillCloseCircle />{" "}
      </button>
    </div>
  );
};

export default Toast;
