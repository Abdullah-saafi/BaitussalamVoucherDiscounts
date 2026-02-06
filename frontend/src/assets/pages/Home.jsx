import LoginComp from "../componenets/LoginComp";

const Home = () => {
  return (
    <div className="main  mt-25 flex items-center  shadow-lg shadow-black-500/50 justify-around mx-20 ">
      <div className="flex-1 flex justify-center shadow-lg shadow-black-500/400">
        <img src="/imgs/Logo.jpg" alt="" />
      </div>
      <div className="flex-1 shadow-xl shadow-blue-500/400">
        <LoginComp />
      </div>
    </div>
  );
};

export default Home;
