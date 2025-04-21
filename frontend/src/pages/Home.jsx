import "../assets/Home.css";
import MainContainer from "../components/mainContainer";
import NewFeed from "../components/newFeed";
import SideBar from "../components/sideBar";

const Home = () => {
  return (
    <div className="home-container">
      <SideBar />
      <MainContainer />
      <NewFeed />
    </div>
  );
};

export default Home;
