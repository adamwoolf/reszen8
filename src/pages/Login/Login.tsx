import LoginForm from "../../components/LoginForm/LoginForm";
import "./LoginStyles.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // if (currentUser) navigate("/dashboard");
  }, [currentUser]);

  return (
    <div className='login-container'>
      <LoginForm />
    </div>
  );
};

export default Login;
