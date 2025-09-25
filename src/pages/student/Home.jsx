import Footer from '../../components/student/Footer';
import Hero from '../../components/student/Hero'; 
const Home = () => {

  return (
    <div className="flex flex-col items-center space-y-7 text-center">
      <Hero /> 
      <Footer />
    </div>
  );
};

export default Home;
