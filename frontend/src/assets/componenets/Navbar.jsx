import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="main bg-[#2b7fff] text-white text-5xl py-6 text-center font-extrabold flex items-center justify-between px-20">
      <img src="/imgs/navbarlogo.svg" alt="" className="max-h-20" />
      <h1>Baitussalam Walfare Trust</h1>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-lg font-normal">Welcome, {user.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-base font-semibold px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
