import React, { useState, useRef, useEffect } from 'react';

const Login = (props) => {
  const emailRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState('');
  const [emailFoucs, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [pwdFocus, setPwdFocus] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();

    try {
      props.onLogin(email, pwd);
      setSuccess(true);
      setEmail('');
      setPwd('');
    } catch (err) {
      if (!err.response) {
        setErrMsg('Brak odpowiedzi od serwera');
      } else {
        setErrMsg('Błąd logowania');
      }
      errRef.current.focus();
    }
  };

  return (
    <>
      {success || props.isAuth ? (
        <div className='auth-form-container'>
          <h1>Pomyślnie zalogowano!</h1>
          <button onClick={props.onLogout}>Wyloguj</button>
        </div>
      ) : (
        <div className='auth-form-container'>
          <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'}>
            {errMsg}
          </p>
          <h2>Logowanie</h2>
          <form className='login-form' onSubmit={submitHandler}>
            <label htmlFor='email'>Email</label>
            <input
              value={email}
              ref={emailRef}
              onChange={(e) => setEmail(e.target.value)}
              type='email'
              placeholder='przyklad@email.com'
              required
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              id='email'
              name='email'
            />
            <label htmlFor='password'>Hasło</label>
            <input
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              type='password'
              placeholder='********'
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
              id='password'
              name='password'
            />
            <button type='submit'>Zaloguj</button>
          </form>
          <button
            className='link-btn'
            onClick={() => props.onFormSwitch('register')}
          >
            Nie masz konta? Zarejestruj się.
          </button>
        </div>
      )}
    </>
  );
};

export default Login;
