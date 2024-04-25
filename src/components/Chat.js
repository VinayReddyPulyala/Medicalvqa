import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import train_0422 from "D:/Project_3_1/medical_vqa/src/components/Samples/train_0422.jpg";
import train_0929 from "D:/Project_3_1/medical_vqa/src/components/Samples/train_0929.jpg";
import train_0218 from "D:/Project_3_1/medical_vqa/src/components/Samples/train_0218.jpg";


const Chat = () => {
  let navigate = useNavigate();
  const [query, setquery] = useState({
    file: null, question: ""
  });
  const [answer, setanswer] = useState("");
  const [imgurl, seturl] = useState("");
  const [sessions, setsessions] = useState([]);
  const [model, setmodel] = useState("Blip_model");
  const [uploadstatus, setuploadstatus] = useState(false);
  const [currsessionind, setcurrsessionid] = useState(0);
  const inputref = useRef(null);

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

  useEffect(() => {

    async function func() {
      try {
        let { data } = await axios.get("http://localhost:8800/", {
          withCredentials: true
        });
        if (data.error) {
          navigate("/");
          console.log(data.error);
          generateerror("Login Required!!");
        }
        else {
          setcurrsessionid(data.sessions.length - 1);
          setsessions(data.sessions);
        }
      } catch (err) {
        console.log(err);
        navigate("/");
        generateerror("Internal Server Error! Please Try Again after some time");
      }
    }

    func();
    
  }, []);

  let handleFileChange = (e) => {

    setquery({ ...query, file: e.target.files[0] });
    console.log('Selected File:', e.target.files[0]);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        seturl(reader.result);
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  let handleprediction = async () => {
    setuploadstatus(true);
    
    const formData = new FormData();
    formData.append('file', query.file);
    formData.append('question', query.question);
    try {
      // let { data } = await axios.post("http://51.20.252.134:80/api/Blip_model", formData, {
      let { data } = await axios.post(`http://127.0.0.1:500${model === "Blip_model" ? 1 : 0}/api/${model}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });


      setanswer(data.answer);
      formData.append('answer', data.answer);
      formData.append('sessionind', currsessionind);
      
      let { data: data1 } = await axios.post("http://localhost:8800/addSessionItem", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      setsessions(data1.sessions);
      setanswer("");
      seturl("");
      setquery({
        file: null, question: ""
      })
      inputref.current.value = '';
      console.log(data.answer);
    }
    catch (err) {
      console.log(err);
    }
    setuploadstatus(false);
  }

  let handlelogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/logout", {}, {
        withCredentials: true
      })
      generatesuccess("Successfully Logged Out");
      navigate("/");
    }
    catch (err) {
      console.log(err);
    }
  }
  let handlecreatesession = async (e) => {
    let { data } = await axios.post("http://localhost:8800/createSession", {}, {
      withCredentials: true
    });

    if (data.error) {
      generateerror(data.error);
    }
    else {
      setsessions(data.sessions);
      setcurrsessionid(data.sessions.length - 1);
    }
  }

  const handleimageclick = async (event) => {
    const imgSrc = event.target.src;
    const fileName = 'image.jpg';

    try {
      const response = await axios.get(imgSrc, { responseType: 'blob' });
      const file = new File([response.data], fileName, { type: response.headers['content-type'] });
      console.log('File Object:', file);
      setquery({ ...query, file: file });
      console.log('Selected File:', file);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          seturl(reader.result);
        }
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }
  return (
    <div className='container-fluid text-light'>
      {
        uploadstatus && (
          <div className="loading-overlay">
            <div className="fw-semibold fs-5 text-light">Please wait...</div>
            <div className="loading"></div>
          </div>
        )
      }

      <div className="modal fade text-dark" id="samples" tabIndex="-1" aria-labelledby="Testsample" aria-hidden="true">
        <div className="modal-dialog modal-lg  modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="Testsample">Test Samples</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body mx-3">
              <div className='row'>
                <div className='col-md-5 col'>
                  <img src={train_0422} alt="" data-bs-toggle="modal" data-bs-target="#samples" style={{ maxHeight: "70%" }} onClick={handleimageclick} />
                </div>
                <div className='col-md-7 col'>
                  <div>
                    <div>
                      Question 1 : Where are liver stem cells (oval cells) located?
                    </div>
                    <div>
                      Answer : in the canals of hering
                    </div>
                  </div>
                  <hr />
                  <div>
                    <div>
                      Question 2 : What are stained here with an immunohistochemical stain for cytokeratin 7?
                    </div>
                    <div>
                      Answer : bile duct cells and canals of hering
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-5 col'>
                  <img src={train_0929} alt="" data-bs-toggle="modal" data-bs-target="#samples" style={{ maxHeight: "50%" }} onClick={handleimageclick} />
                </div>
                <div className='col-md-7 col'>
                  <div>
                    <div>
                      Question 1 : What represent foci of fat necrosis with calcium soap formation at sites of lipid breakdown in the mesentery?
                    </div>
                    <div>
                      Answer : the areas of white chalky deposits
                    </div>
                  </div>
                  <hr />
                  <div>
                    <div>
                      Question 2 : Where do areas of white chalky deposits represent foci of fat necrosis with calcium soap formation?
                    </div>
                    <div>
                      Answer : at sites of lipid breakdown in the mesentery
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-5 col'>
                  <img src={train_0218} alt="" data-bs-toggle="modal" data-bs-target="#samples" style={{ maxWidth: "100%" }} onClick={handleimageclick} />
                </div>
                <div className='col-md-7 col'>
                  <div>
                    <div>
                      Question 1 : How many cm (normal,  1-1.5 cm) is the left ventricular wall thicker than in the example of myocardial hypertrophy lower left?
                    </div>
                    <div>
                      Answer : 2 cm
                    </div>
                  </div>
                  <hr />
                  <div>
                    <div>
                      Question 2 : How many transverse sections of myocardium were stained with triphenyltetra-zolium chloride,  an enzyme substrate that colors viable myocardium magenta?
                    </div>
                    <div>
                      Answer : three
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className='row relative'>
        <button className="btn btn-lg btn-outline-light d-inline d-lg-none position-absolute top-0 start-0 pb-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasResponsive" aria-controls="offcanvasResponsive">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
          </svg>
        </button>
        <div className="offcanvas-lg offcanvas-start col-lg-3 col-md-4 p-5 bg-dark text-light d-flex flex-column justify-content-between" style={{ "--bs-bg-opacity": ".75" }} tabIndex="-1" id="offcanvasResponsive" aria-labelledby="offcanvasResponsiveLabel">
          <div className='mb-2'>
            <div className='d-flex justify-content-between'>
              <h1>
                vqa_med
              </h1>
              <div className='d-flex align-items-center text-light'>
                <button type="button" className="btn btn-close d-lg-none" data-bs-dismiss="offcanvas" data-bs-target="#offcanvasResponsive" aria-label="Close"></button>
              </div>
            </div>
            <span>Ask your Query with our model</span>
            <button className='btn btn-lg btn-outline-light w-100 my-3' onClick={handlecreatesession}>
              New Session
            </button>
            {
              sessions.length !== 0 && <div>
                <h3 className='mb-2 mb-lg-4'>Recent</h3>
                <div className="offcanvas-body w-100" >
                  <div className='overflow-y-auto w-100' style={{ height: "40vh" }}>
                    <div className='px-2 py-3 pt-0'>
                      {
                        sessions.map((val, ind) => {
                          return (
                            <div key={ind} className={`btn btn-lg btn-outline-light w-100 my-3 ${ind === currsessionind ? "active" : ""}`} onClick={() => {
                              setcurrsessionid(ind);
                            }}>
                              Session-{ind + 1}
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <div>
            <button className='shadow-lg btn bg-dark-subtle w-100' onClick={handlelogout}>
              Logout
            </button>
          </div>
        </div>
        <div className='col-12 col-lg-9 mx-auto bg-dark bg-opacity-50 py-5 vh-100 d-flex flex-column justify-content-between'>
          <div>
            <div className='text-center mb-3 mt-2'>
              <button className='btn btn-light btn-sm' data-bs-toggle="modal" data-bs-target="#samples">Samples</button>
            </div>

            <div className='col-12 col-sm-11 col-lg-10 mx-auto mb-5'>
              {sessions.length !== 0 && sessions[currsessionind].length !== 0 && (
                <div className='border border-light py-3 rounded overflow-y-auto' style={{ height: '45vh' }}>
                  {sessions[currsessionind].map((val, ind) => {
                    // Convert Uint8Array to base64 string
                    const uint8Array = new Uint8Array(val.image.data);
                    const blob = new Blob([uint8Array], { type: 'image/jpeg' });

                    // Create data URL for the blob
                    const imageSrc = URL.createObjectURL(blob);
                    return (
                      <div key={ind} className='row col-10 mx-auto bg-dark-subtle p-3 rounded text-dark my-4'>
                        <div className='text-center mb-2 col-12' style={{ height: '100px' }}>
                          <img src={imageSrc} alt='...' style={{ maxHeight: '100%', maxWidth: '100%' }} />
                        </div>
                        <div className='row'>
                          <label className='col-sm-2 col-form-label'>Question: </label>
                          <div className='col-sm-10'>
                            <input type='text' readOnly className='form-control-plaintext' value={val.question} />
                          </div>
                        </div>
                        <div className='row'>
                          <label className='col-sm-2 col-form-label'>Answer: </label>
                          <div className='col-sm-10'>
                            <input type='text' readOnly className='form-control-plaintext' value={val.answer} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className='row col-sm-11 col-lg-10 mx-auto bg-dark-subtle p-2 rounded my-2'>
            <div className='col-12'>
              <select onChange={(e) => {
                setmodel(e.target.value);
              }} className='border rounded col-2 my-2'>
                <option value="Blip_model">Blip_model</option>
                <option value="Fusion_one_word_model">One_Word_Fusion_model</option>
                <option value="Fusion_desc_word_model">Desc_Word_Fusion_model</option>
              </select>
            </div>
            {
              imgurl && <div className="text-center mb-2" style={{ height: "100px" }}>
                <img src={imgurl} alt="..." style={{ maxHeight: "100%", maxWidth: "100%" }} />
              </div>
            }
            <div className='col-2 col-md-1 px-auto my-auto'>
              <label className='btn btn-sm btn-light pb-2'>
                <input type="file" className='d-none' accept='image/*' onChange={handleFileChange} />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-image" viewBox="0 0 16 16">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12" />
                </svg>
              </label>
            </div>
            <div className='col-8 col-md-10'>
              <input type="text" className='form-control me-2' ref={inputref} onChange={(e) => {
                setquery({ ...query, question: e.target.value });
              }} />
            </div>
            <div className='col-2 col-md-1 py-1' onClick={handleprediction}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-arrow-right-circle text-light pb-1" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
              </svg>
            </div>
            {
              answer.length !== 0 && <div className='col-12 mx-auto py-1 px-3 mt-3 bg-light rounded text-dark'>
                {answer}
              </div>
            }
          </div>
        </div>
      </div>
    </div >
  )
}

export default Chat
