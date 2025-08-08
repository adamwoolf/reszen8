import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "./LoginFormStyles.scss";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();

      await login(email, password, rememberMe);
      console.log("logged in");
      // Redirect to Members Area after successful login
      navigate("/");
      toast.success("Successfully logged in!");
    } catch (error) {
      // Error is already handled by AuthContext
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Sign in to your account</h2>
        </div>
        <form className='form' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label htmlFor='email-address' className='sr-only'>
                Email address
              </label>
              <input
                id='email-address'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='form__input'
                placeholder='Email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='form__input'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className='form__prompts'>
            <div>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='form_checkbox'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor='remember-me' className='form_remember'>
                Remember me
              </label>
            </div>

            <div className='text-sm'>
              <Link to='/forgot-password' className='font-medium text-indigo-600 hover:text-indigo-500'>
                Forgot your password?
              </Link>
            </div>
          </div>

          {error && <div className='text-red-600 text-sm text-center'>{error}</div>}

          <div>
            <button type='submit' disabled={isSubmitting} className='form__signin'>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className='text-center mt-4 space-y-2'>
          <p className='text-sm text-gray-600'>
            Don't have an account?{" "}
            <Link to='/signup' className='font-medium text-indigo-600 hover:text-indigo-500'>
              Sign up
            </Link>
          </p>
          <div className='pt-2'>
            <Link to='/' className='text-sm font-medium text-gray-600 hover:text-gray-900'>
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
