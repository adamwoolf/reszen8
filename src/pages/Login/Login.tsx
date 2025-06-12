import LoginForm from "../../components/LoginForm/LoginForm";
import "./LoginStyles.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log(currentUser);
    if (currentUser) navigate("/members");
  }, [currentUser]);

  return (
    <div className='login-container'>
      <LoginForm />
    </div>
  );
};

export default Login;
