import React, { useRef, useState, useEffect } from 'react';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

export const Register = (props) => {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1) {
      setErrMsg('Niepoprawna nazwa użytkownika');
      return;
    } else if (!v2) {
      setErrMsg('Niepoprawne hasło');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/register')
        .then((res) => res.json())
        .then((data) => console.log(data.message));
      setSuccess(true);
      setUser('');
      setPwd('');
      setMatchPwd('');
    } catch (err) {
      if (!err.response) {
        setErrMsg('Brak odpowiedzi od serwera');
      } else {
        setErrMsg('Błąd rejestracji');
      }
      errRef.current.focus();
    }
  };

  return (
    <>
      {success ? (
        <div className='auth-form-container'>
          <h1>Pomyślnie zarejestrowano!</h1>
          <p>
            <a onClick={() => props.onFormSwitch('login')}>Zaloguj się</a>
          </p>
        </div>
      ) : (
        <div className='auth-form-container'>
          <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'}>
            {errMsg}
          </p>
          <h2>Rejestracja</h2>
          <form className='register-form' onSubmit={handleSubmit}>
            <label htmlFor='username'>Nazwa użytkownika</label>
            <input
              type='text'
              id='username'
              ref={userRef}
              autoComplete='off'
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
              placeholder='login'
              aria-invalid={validName ? 'false' : 'true'}
              aria-describedby='uidnote'
            />
            <p
              id='uidnote'
              className={
                userFocus && user && !validName ? 'instructions' : 'offscreen'
              }
            >
              4 do 24 liter.
              <br />
              Musi zanczyać się od litery.
              <br />
              Litery, cyfry, podkreślenia, myślniki dozwolone.
            </p>
            <label htmlFor='email'>Email</label>
            <input
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
              type='email'
              required
              placeholder='przyklad@email.com'
              id='email'
              name='email'
            />
            <label htmlFor='password'>Hasło</label>
            <input
              type='password'
              id='password'
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
              placeholder='********'
              aria-invalid={validPwd ? 'false' : 'true'}
              aria-describedby='pwdnote'
            />
            <p
              id='pwdnote'
              className={pwdFocus && !validPwd ? 'instructions' : 'offscreen'}
            >
              8 do 24 liter.
              <br />
              Musi zawierać dużą i małą literę, a cyfrę oraz znak specyjalny.
              <br />
              Dozwolone znaki specyjalne:{' '}
              <span aria-label='exclamation mark'>!</span>{' '}
              <span aria-label='at symbol'>@</span>{' '}
              <span aria-label='hashtag'>#</span>{' '}
              <span aria-label='dollar sign'>$</span>{' '}
              <span aria-label='percent'>%</span>
            </p>
            <label htmlFor='confirm_pwd'>Powtórz hasło</label>
            <input
              type='password'
              id='confirm_pwd'
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
              placeholder='********'
              aria-invalid={validMatch ? 'false' : 'true'}
              aria-describedby='confirmnote'
            />
            <p
              id='confirmnote'
              className={
                matchFocus && !validMatch ? 'instructions' : 'offscreen'
              }
            >
              Hasła muszą się zgadzac.
            </p>
            <button type='submit'>Zarejestruj się</button>
          </form>
          <button
            className='link-btn'
            onClick={() => props.onFormSwitch('login')}
          >
            Masz już konto? Zaloguj się.
          </button>
        </div>
      )}
    </>
  );
};
