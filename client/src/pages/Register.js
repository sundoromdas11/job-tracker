import { useState, useEffect } from 'react';
import { Logo, FormRow, Alert } from '../components';
import Wrapper from '../assets/wrappers/RegisterPage';

import { useAppContext } from '../context/appContext';
import { useNavigate } from 'react-router-dom';

const initialSte = {
  name: '',
  email: '',
  password: '',
  isMember: true,
};

const Register = () => {
  const [values, setValues] = useState(initialSte);
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    showAlert,
    displayAlert,

    setupUser,
  } = useAppContext();

  const toggleMember = () => {
    setValues({ ...values, isMember: !values.isMember });
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, password, isMember } = values;
    if (!email || !password || (!isMember && !name)) {
      displayAlert();
      return;
    }
    const currentUser = { name, email, password };
    if (isMember) {
      setupUser({
        currentUser,
        endPoint: 'login',
        alertText: 'Login Successful! Redirecting...',
      });
    } else {
      setupUser({
        currentUser,
        endPoint: 'register',
        alertText: 'User created! Redirecting...',
      });
    }
  };
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        window.location.href='/'
      }, 1000);
    }
  }, [user, navigate]);
  return (
    <Wrapper className="full-page">
      <form action="" className="form" onSubmit={handleSubmit}>
        <Logo />
        <h3> {values.isMember ? 'Login' : 'Register'} </h3>
        {showAlert && <Alert />}
        {/* name input */}
        {!values.isMember && (
          <FormRow
            type="text"
            name="name"
            value={values.name}
            handleChange={handleChange}
          />
        )}

        {/* email input */}
        <FormRow
          type="email"
          name="email"
          value={values.email}
          handleChange={handleChange}
        />
        {/* password input */}
        <FormRow
          type="password"
          name="password"
          value={values.password}
          handleChange={handleChange}
        />

        <button type="submit" className="btn btn-block" disabled={isLoading}>
          submit
        </button>
        <button
          className="btn btn-block btn-hipster"
          type="button"
          disabled={isLoading}
          onClick={() => {
            setupUser({
              currentUser: {
                email: 'testuser@gmail.com',
                password: 'secret',
              },
              endPoint: 'login',
              alertText: 'Login Successfu! Redirecting...',
            });
          }}
        >
          {isLoading ? 'loading...' : 'demo app'}
        </button>
        <p>
          {values.isMember ? 'Not a member yet ?' : 'Already a member'}
          <button type="button" onClick={toggleMember} className="member-btn">
            {values.isMember ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </Wrapper>
  );
};
export default Register;
