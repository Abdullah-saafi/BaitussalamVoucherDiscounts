import LoginComp from "../componenets/LoginComp";

const Home = () => {
  return (
    <div className="main h-[70vh]  mt-25 flex  justify-around mx-20 ">
      <div className="flex-1 flex justify-center shadow-lg shadow-black-500">
        <img src="/imgs/Logo.jpg" alt="" />
      </div>
      <div className="flex-1 shadow-lg shadow-black-500">
        <LoginComp />
      </div>
    </div>
  );
};

export default Home;
