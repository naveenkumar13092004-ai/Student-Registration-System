import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span>🎓</span>
        <h2>Student<span>Portal</span></h2>
      </div>

      <div className="nav-links">
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>

        {token && <Link to="/dashboard">Dashboard</Link>}

        {token && (
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;