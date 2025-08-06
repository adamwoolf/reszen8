import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./SignupStyles.scss";
export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      await signup(email, password, firstName, surName);
    } catch (error) {
      setError("Failed to create an account. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log(currentUser);
    if (currentUser) navigate("/members");
  }, [currentUser]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Create a new account</h2>
        </div>
        {error && (
          <div className='bg-red-50 border-l-4 border-red-400 p-4'>
            <div className='flex'>
              <div className='ml-3'>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}
        <form className='form' onSubmit={handleSubmit}>
          <div>
            <div className='form__input-container'>
              <label htmlFor='email-address' className='sr-only'>
                First Name
              </label>
              <input
                name='firstName'
                type='text'
                required
                className='form__input'
                placeholder='First Name'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className='form__input-container'>
              <label htmlFor='email-address' className='sr-only'>
                Surname
              </label>
              <input
                name='surName'
                type='text'
                required
                className='form__input'
                placeholder='Surname'
                value={surName}
                onChange={(e) => setSurName(e.target.value)}
              />
            </div>
            <div className='form__input-container'>
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
            <div className='form__input-container'>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                className='form__input'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className='form__input-container'>
              <label htmlFor='confirm-password' className='sr-only'>
                Confirm Password
              </label>
              <input
                id='confirm-password'
                name='confirm-password'
                type='password'
                autoComplete='new-password'
                required
                className='form__input'
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type='submit' disabled={loading} className='form__submit'>
              {loading ? "Creating account..." : "Start Free Trial"}
            </button>
          </div>
        </form>
        <div className='text-center mt-4 space-y-2'>
          <p className='text-sm text-gray-600'>
            Already have an account?{" "}
            <Link to='/login' className='font-medium text-blue-600 hover:text-blue-500'>
              Sign in
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
}
