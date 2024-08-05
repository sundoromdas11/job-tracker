import Wrapper from '../assets/wrappers/LandingPage';
import { Logo } from '../components';
import main from '../assets/images/main.svg';
import { Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../context/appContext';

const Landing = () => {
  const { user } = useAppContext();
  return (
    <>
      {user && <Navigate to="/" />}
      <Wrapper>
        <nav>
          <Logo />
        </nav>
        <div className="container page">
          {/* info */}
          <div className="info">
            <h1>
              Job <span>tracking</span> app
            </h1>
            <p>
              I'm baby next level ennui hell of subway tile biodiesel ramps,
              PBR&B organic forage. Squid iPhone seitan pickled shaman stumptown
              vaporware mukbang lumbersexual ascot. Mukbang butcher umami yes
              plz ramps banjo offal health goth narwhal godard fixie kale chips
              tousled.
            </p>
            <Link to="/register" className="btn btn-hero">
              Login/Register{' '}
            </Link>
          </div>
          <img src={main} alt="job hunt" className="img main-img" />
        </div>
      </Wrapper>
    </>
  );
};

export default Landing;
