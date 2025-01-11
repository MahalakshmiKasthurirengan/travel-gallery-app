import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/Input/PasswordInput';
import { useState } from 'react';
import { validateEmail } from '../../../utils/helper';
import axiosInstance from '../../../utils/axiosInstance';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)){
        setError("Please enter a valid email address.");
        return;
    }

    if(!password) {
        setError("Please enter the password");
        return;
    }

    setError("");

    // Login API Call 
    try{
        const response = await axiosInstance.post("/login", {
            email: email,
            password: password,
        });

        if(response.data && response.data.accessToken){
            localStorage.setItem("token", response.data.accessToken);
            navigate("/dashboard");
        }
    } catch(error){

        if(
            error.response &&
            error.response.data &&
            error.response.data.message
        ){
            setError(error.response.data.message);
        } else{
            setError("An unexpected error occurred. Please try again.");
        }
    }
  };
  return (
    <div className='h-screen bg-pink-100 overflow-hidden relative'>
        <div className='login-ui-box right-10 -top-40' />
        <div className='login-ui-box bg-pink-200 -bottom-40 right-1/2' />
      <div className='container h-screen flex items-center justify-center px-20 mx-auto'>
        <div className='w-2/4 h-[90vh] flex items-end bg-login-bgimg bg-cover rounded-lg p-10 z-50'>
            <div>
                <h4 className='text-5xl text-white font-semibold leading-[58px]'>Save Your <br/> Moments</h4>
                <p className='text-[15px] text-white leading-6 pr-7 mt-4'>
                Capture the journey, relive the memories, 
                and share your adventures with the world
                </p>
            </div>

        </div>
        <div className='w-2/4 h-[75vh] bg-white rounded-r-lg relative p-20 shadow-lg shadow-pink-200/20'>
            <form onSubmit={handleLogin}>
                <h4 className='text-2xl font-semibold mb-7'>Login</h4>

                <input 
                type='text' 
                placeholder='Email' 
                className='input-box'
                value={email}
                onChange={({ target }) => {
                    setEmail(target.value);
                }}
                />

                <PasswordInput
                value={password}
                onChange={({ target }) => {
                    setPassword(target.value);
                }}
                />

                {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

                <button type='submit' className='btn-primary'>
                    LOGIN
                </button>

                <p className='text-xs text-slate-500 text-center my-4'>Or</p>

                <button
                type='submit'
                className='btn-primary btn-light'
                onClick={() => {
                    navigate("/signUp");
                }}>
                CREATE ACCOUNT
                </button>
            </form>
        </div>
      </div>
    </div>
  )
}

export default Login
