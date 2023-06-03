import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './Auth.css';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const RegisterPage = (props) => {
  const userRef = useRef();
  const errRef = useRef();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // const navigate = useNavigate();

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

  const submitHandler = (e) => {
    e.preventDefault();

    const userData = {
      firstName: firstName,
      lastName: lastName,
      name: user,
      email: email,
      password: pwd,
      birthDate: birthDate,
      phoneNumber: phoneNumber,
    };

    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1) {
      setErrMsg('Niepoprawna nazwa użytkownika');
      return;
    } else if (!v2) {
      setErrMsg('Niepoprawne hasło');
      return;
    } else if (!validMatch) {
      setErrMsg('Hasła muszą się zgadzać');
      return;
    }
    try {
      props.onRegister(userData);
      setSuccess(true);
      setFirstName('');
      setLastName('');
      setUser('');
      setEmail('');
      setPwd('');
      setMatchPwd('');
      setBirthDate('');
      setPhoneNumber('');
      // navigate('/');
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
      {/* {success ? (
        <div className='auth-form-container'>
          <h1>Pomyślnie zarejestrowano!</h1>
          <p>
            <a onClick={() => props.onFormSwitch('login')}>Zaloguj się</a>
          </p>
        </div>
      ) : ( */}
      <div className='auth-form-container'>
        {success && <p className='succesmsg'>Pomyślnie zarejestrowano!</p>}
        <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'}>
          {errMsg}
        </p>
        <h2>Rejestracja</h2>
        <form className='register-form' onSubmit={submitHandler}>
          <label htmlFor='first_name'>Imię</label>
          <input
            type='text'
            id='first_name'
            name='first_name'
            autoComplete='off'
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setSuccess(false);
            }}
            required
            placeholder='imie'
          />
          <label htmlFor='last_name'>Naziwsko</label>
          <input
            type='text'
            id='last_name'
            name='last_name'
            autoComplete='off'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder='nazwisko'
          />
          <label htmlFor='username'>Nazwa użytkownika</label>
          <input
            type='text'
            id='username'
            name='username'
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
            type='email'
            id='email'
            name='email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
            placeholder='przyklad@email.com'
          />
          <label htmlFor='password'>Hasło</label>
          <input
            type='password'
            id='password'
            name='password'
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
            Musi zawierać dużą i małą literę,
            <br />
            oraz cyfrę i znak specyjalny.
            <br />
            Dozwolone znaki specyjalne:{' '}
            <span aria-label='exclamation mark'>!</span>{' '}
            <span aria-label='at symbol'>@</span>{' '}
            <span aria-label='hashtag'>#</span>{' '}
            <span aria-label='dollar sign'>$</span>{' '}
            <span aria-label='percent'>%</span>
          </p>
          <label htmlFor='matchPwd'>Powtórz hasło</label>
          <input
            type='password'
            id='matchPwd'
            name='matchPwd'
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
            className={matchFocus && !validMatch ? 'instructions' : 'offscreen'}
          >
            Hasła muszą się zgadzac.
          </p>
          <label htmlFor='birth_date'>Data Urodzenia</label>
          <input
            type='date'
            id='birth_date'
            name='birth_date'
            autoComplete='off'
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          <label htmlFor='phone_number'>Numer telefonu</label>
          <input
            type='text'
            id='phone_number'
            name='phone_number'
            autoComplete='off'
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            placeholder='000000000'
          />
          <button type='submit'>Zarejestruj się</button>
        </form>
        <Link
          to='/'
          className='link-btn'
          // onClick={() => props.onFormSwitch('login')}
        >
          Masz już konto? Zaloguj się.
        </Link>
      </div>
    </>
  );
};

export default RegisterPage;
