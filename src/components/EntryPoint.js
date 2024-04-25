import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";
import OtpInput from 'react-otp-input';

const EntryPoint = () => {
  let navigate = useNavigate();
  let [logupd, setLogupd] = useState("signup");
  let [user, setuser] = useState({
    email: "",
    password: ""
  });
  let [otp, setotp] = useState(null);
  let [checkpswd, setcheckpswd] = useState(null);
  const [timer, setTimer] = useState(-1);

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval); 
  }, [timer]);

  useEffect(()=>{
    async function func(){
      try{
        let {data} = await axios.get("http://localhost:8800/initlog",{
          withCredentials : true
        });
        if(data.Success){
          navigate("/chat");
        }
      }
      catch(err){
        console.error(err);
      }
    }

    func();
  },[]);


  let generateerror = (err) => {
    toast.error(err, {
      position: "bottom-right",
      autoClose: 2000,
      closeOnClick: true,
      hideProgressBar: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  let generatesuccess = (mes) => {
    toast.success(mes, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  let sendotp = async () => {
    try {
      if (user.email.length === 0 || !user.email.includes("@gmail.com")) {
        generateerror("Incorrect Email");
        return;
      }
      if (logupd !== "otp-phase") {
        setLogupd("otp-phase");
      }
      let email = user.email;
      let { data } = await axios.post("http://localhost:8800/sendotp", { email });
      if (data.error) {
        generateerror(data.error);
      }
      else {
        setTimer(180);
        generatesuccess("OTP sent to your Email");
      }
    }
    catch (err) {
      generateerror(err.message);
    }
  }

  let verifyotp = async () => {
    try {
      if (user.email.length === 0 || !user.email.includes("@gmail.com")) {
        generateerror("Incorrect Email");
        return;
      }
      if (logupd !== "otp-phase") {
        setLogupd("otp-phase");
      }
      let verify = { email: user.email, otp };
      let { data } = await axios.post("http://localhost:8800/userverification", verify);
      if (data.error) {
        generateerror(data.error);
      }
      else {
        setTimer(0);
        setLogupd("signup-lst");
        generatesuccess("OTP verified");
      }
    }
    catch (err) {
      generateerror(err.message);
    }
  }

  let handlelogin = async () => {
    try {
      let { data } = await axios.post("http://localhost:8800/login", user,{
        withCredentials : true
      });
      if (data.error) {
        generateerror(data.error);
      }
      else {
        navigate(`/chat`);
        generatesuccess("Successfully Logged In");
      }
    } catch (err) {
      generateerror("Internal Server Error! Please Visit again after some time.");
    }
  }


  let handlesignup = async () => {
    console.log(user.password, checkpswd);
    if (user.password !== checkpswd) {
      generateerror('Enter Matching Passwords');
      return;
    }
    try {
      let { data } = await axios.post("http://localhost:8800/register", user,{
        withCredentials: true
      });
      console.log(data);
      if (data.error) {
        generateerror(data.error);
      }
      else {
        navigate(`/chat`);
        generatesuccess("Successfully Logged In");
      }
    } catch (err) {
      generateerror("Internal Server Error! Please Visit again after some time.");
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className='container-fluid d-flex vh-100 align-items-center'>
      <div className='col-lg-4 col-10 col-sm-8 col-md-6 mx-auto rounded-5 border border-light p-xl-4 p-lg-3 p-md-4 p-3 pb-2 text-light'>
        <div className='text-center display-6 fst-italic mb-5'>
          Welcome To vqa_meds
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-capsule" viewBox="0 0 16 16">
            <path d="M1.828 8.9 8.9 1.827a4 4 0 1 1 5.657 5.657l-7.07 7.071A4 4 0 1 1 1.827 8.9Zm9.128.771 2.893-2.893a3 3 0 1 0-4.243-4.242L6.713 5.429l4.243 4.242Z" />
          </svg>
        </div>
        {
          (() => {
            if (logupd === "signup") {
              return (
                <div>
                  <div className='text-center my-3 link-underline-light'>
                    Create an Account to chat with our model
                  </div>
                  <div>
                    <label htmlFor='email' className='form-label'>
                      Enter Your Email :
                    </label>
                    <input type="email" placeholder='Enter Here' className='form-control bg-dark-subtle' id="email" onChange={(event) => {
                      setuser({ ...user, email: event.target.value });
                    }} />
                  </div>
                  <div className='d-flex justify-content-end mt-2'>
                    <button className='btn btn-outline-light' onClick={sendotp}>
                      Sign-Up
                    </button>
                  </div>
                  <div className='form-text text-center text-light mt-3'>
                    Already Have an Account?
                    <span className='ms-2 link-primary pe-auto' onClick={() => {
                      setLogupd("login");
                    }}>login</span>
                  </div>
                </div>
              )
            }
            else if (logupd === "otp-phase") {
              return (
                <div>
                  <div className='text-center my-3'>
                    Create an Account to chat with our model
                  </div>
                  <div className='my-4'>
                    <label htmlFor='otp' className='form-label'>
                      Enter OTP :
                    </label>
                    <OtpInput value={otp} onChange={setotp} numInputs={6} renderSeparator={<span>-</span>}
                      renderInput={(props) => <input {...props} className='border rounded-3' />} />
                    <div className='form-text text-light text-conter'>
                      An OTP has been sent to your email! Please type it here for our verification.
                      {timer > 0 ? (
                        <p>Expires in: {formatTime(timer)}</p>
                      ) : (timer!==-1?<p>OTP EXpired</p>:null)}
                    </div>
                  </div>

                  <div className='d-flex justify-content-between mt-2'>
                    <button className='btn btn-outline-light' onClick={sendotp}>Re-Send OTP</button>
                    <button className='btn btn-outline-light' onClick={verifyotp}>Submit</button>
                  </div>

                  <div className='link-primary d-flex justify-content-center' >
                    <span onClick={() => {
                      setLogupd("signup");
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                      </svg>
                      back
                    </span>
                  </div>
                </div>
              )
            }
            else if (logupd === "signup-lst") {
              return (
                <div>
                  <div className='text-center my-3'>
                    Create an Account to chat with our model
                  </div>

                  <div className='my-4'>
                    <label htmlFor='pswd1' className='form-label'>
                      Enter Password :
                    </label>
                    <input type="password" id='pswd1' className='form-control' onChange={(event) => {
                      setuser({ ...user, password: event.target.value });
                    }} />
                  </div>

                  <div className='my-4'>
                    <label htmlFor='pswd2' className='form-label'>
                      Confirm Password :
                    </label>
                    <input type="password" id='pswd2' className='form-control' onChange={(event) => {
                      setcheckpswd(event.target.value);
                    }} />
                  </div>
                  <div className='d-flex justify-content-end mt-2'>
                    <button className='btn btn-outline-light' onClick={handlesignup}>Sign-up</button>
                  </div>

                  <div className='link-primary text-center pe' onClick={() => {
                    setLogupd("signup");
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                    </svg>
                    back</div>
                </div>
              )
            }
            else if (logupd === "login") {
              return (
                <div>
                  <div className='text-center my-3'>
                    login to chat with our model
                  </div>
                  <div className='my-4'>
                    <label htmlFor='email' className='form-label'>
                      Enter Your Email :
                    </label>
                    <input type="email" placeholder='Enter Here' className='form-control bg-dark-subtle' id="email" onChange={(event) => {
                      setuser({ ...user, email: event.target.value });
                    }} />
                  </div>
                  <div className='my-4'>
                    <label htmlFor='passwd' className='form-label'>
                      Enter Your Password :
                    </label>
                    <input type="password" placeholder='Enter Here' className='form-control bg-dark-subtle' id="passwd" onChange={(event) => {
                      setuser({ ...user, password: event.target.value });
                    }} />
                  </div>
                  <div className='d-flex justify-content-end mt-2'>
                    <button className='btn btn-outline-light' onClick={handlelogin}>
                      login
                    </button>
                  </div>
                  <div className='form-text text-center text-light mt-3'>
                    Don't Have an Account?
                    <span className='ms-2 link-primary pe-auto' onClick={() => {
                      setLogupd("signup");
                    }}>Sign-Up</span>
                  </div>
                </div>
              )
            }
          })()
        }

      </div>
    </div>
  )
}

export default EntryPoint
