import "../assets/Home.css";
import MainContainer from "../components/mainContainer";
import NewFeed from "../components/newFeed";
import SideBar from "../components/sideBar";
const Home = () => {
  return (
    <>
      <SideBar />
      <NewFeed />
      <MainContainer />
    </>
  );
};

export default Home;
