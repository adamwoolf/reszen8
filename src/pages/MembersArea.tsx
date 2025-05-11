import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function MembersArea() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="members-area">
      <h1>Welcome to the Members Area</h1>
      <p>Your email: {currentUser.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
