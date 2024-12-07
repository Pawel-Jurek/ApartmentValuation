
import React, { useEffect } from 'react';
import { useState } from 'react';
import axiosInstance from '../auth/axiosSetup';
import { AuthData } from '../auth/AuthWrapper';
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';
import Avatar from '../assets/avatar.jpg';

const Account = () => {

  const {user} = AuthData();
  const [errorMessage, setErrorMessage] = useState("");
  const [districts, setDistricts] = useState([]);
  const { logout } = AuthData();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() +1; 
  const [form, setForm] = useState({
    city: '',
    district: '',
    square: 45,
    rooms:3,
    floor: 2,
    year: 1999,
    prediction_year: currentYear,
    prediction_month: currentMonth,
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    axiosInstance.get('http://localhost:8000/users/searches/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    .then(response => {
      console.log(response.data);
      setHistory(response.data);
    })
  }, []);

  const latestSearchDate = Math.max(...history.map(record => new Date(record.search_date).getTime()));

  const handlePredict = async (e) => {
    e.preventDefault(); 
  
    if (user.tokensLeft === 0) {
      toast.error("You have no tokens left. Please buy more tokens.", { position: 'top-left' });
      return; 
    }
  
    const accessToken = localStorage.getItem('accessToken');
    const { city, district, square, rooms, floor, year, prediction_year, prediction_month } = form;
  
    if (!city) {
      toast.error("Please select a city.", { position: 'top-left' });
      return;
    }
    if (!district) {
      toast.error("Please select a district.", { position: 'top-left' });
      return;
    }
    if (square <= 0) {
      toast.error("Square footage must be a positive number.", { position: 'top-left' });
      return;
    }
    if (rooms <= 0) {
      toast.error("The number of rooms must be a positive number.", { position: 'top-left' });
      return;
    }
    if (floor < 0) {
      toast.error("Floor number cannot be negative.", { position: 'top-left' });
      return;
    }
    if (year < 1900 || year > new Date().getFullYear()) {
      toast.error("Year of construction must be between 1900 and the current year.", { position: 'top-left' });
      return;
    }
  
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; 
  
    if (prediction_year < currentYear || prediction_year > currentYear + 1000) {
      toast.error("Prediction year must be between the current year and 1000 years later.", { position: 'top-left' });
      return;
    }
  
    if (prediction_year === currentYear && prediction_month < currentMonth) {
      toast.error("Prediction month must be the current month or later in the current year.", { position: 'top-left' });
      return;
    }
  
    if (prediction_month < 1 || prediction_month > 12) {
      toast.error("Prediction month must be between 1 and 12.", { position: 'top-left' });
      return;
    }
  
    setErrorMessage("");
  
    try {
      const response = await axiosInstance.post(
        'http://localhost:8000/valuation/', 
        { 
          sq: square,
          district: district,
          city: city,
          floor: floor,
          rooms: rooms,
          year: year,
          prediction_month: parseInt(form.prediction_month, 10),
          prediction_year: parseInt(form.prediction_year, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      );
      console.log(response)
      toast.success("Prediction successful!"); 
      window.location.reload(); 
  
    } catch (error) {
      console.error('Error predicting price:', error);
      toast.error("Error: " + error.response?.data?.detail || "An error occurred.");
    }
  };
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleIncrement = (field) => {
    setForm((prevForm) => {
      let newValue = prevForm[field] + 1;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() +1; 
  
      if (field === "prediction_month" && newValue > 12) newValue = 12;
      if (field === "prediction_year" && newValue > currentYear + 1000) newValue = currentYear + 1000;
      if (field === "prediction_year" && newValue === currentYear) {
        if (prevForm.prediction_month < currentMonth) {
          newValue = currentMonth;
        }
      }
      if (field === "floor" && newValue > 100) newValue = 100;
      if (field === "rooms" && newValue > 10) newValue = 10;
      if(field === "square" && newValue > 500) newValue = 500;
      if(field === "year" && newValue > 2024) newValue = currentYear;
  
      return { ...prevForm, [field]: newValue };
    });
  };
  
  const handleDecrement = (field) => {
    setForm((prevForm) => {
      let newValue = prevForm[field] - 1;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() +1; 
  
      if (field === "prediction_month" && newValue < 1) newValue = 1;
      if (field === "prediction_year" && newValue < 1900) newValue = 1900;
      if (field === "prediction_year" && newValue === currentYear) {
        if (prevForm.prediction_month < currentMonth) {
          newValue = currentMonth;
        }
      }
      if (field === "floor" && newValue < 0) newValue = 0;
      if (field === "rooms" && newValue < 1) newValue = 1;
      if(field === "square" && newValue < 1) newValue = 1;
      if(field === "year" && newValue < 1900) newValue = 1900;
  
      return { ...prevForm, [field]: newValue };
    });
  };
  

  const handleCityChange = (e) => {
    const { value } = e.target;
    setForm({ ...form, city: value });
    fetchDistricts(value);
  };

  const fetchDistricts = (city) => {
  
    axiosInstance.get('http://localhost:8000/valuation/addresses/'+city+'/')
      .then(response => {      
        setDistricts(response.data.addresses);
        
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
      });

  };




  return (

    <div>
      <nav className="w-full bg-gray-200 shadow p-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="inline-flex items-center">
            <svg
              className="w-[42px] h-[42px] text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 1 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
              />
            </svg>
            <span className="ml-2 text-black text-lg">Home</span>
          </a>

          <div className="inline-flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 bi bi-coin text-gray-800"
            viewBox="0 0 18 18"
            fill="currentColor"
          >
            <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
          </svg>
          <span className="text-gray-800 text-lg font-medium">{user.tokensLeft}</span>
        </div>
        <div className="flex lg:items-center pr-32">
        {user.isAuthenticated ? (
                <>

                  <Link to="/account"><img src={Avatar} alt="avatar" className="w-10 h-10 rounded-full mr-8 border" />
                    <p className="text-black">{user.username}</p>
                  </Link>
                  <button onClick={logout} class="relative h-12 w-24 rounded-full overflow-hidden border border-black text-black shadow-2xl transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:h-0 before:w-0 before:rounded-sm before:bg-black before:duration-300 before:ease-out hover:text-white hover:shadow-indigo-600 hover:before:h-40 hover:before:w-40 hover:before:opacity-80">
                    <span class="relative z-10">Log out</span>
                  </button>
                </>
              ) : (
                <button class="relative h-12 w-24 rounded-full overflow-hidden border border-black text-black shadow-2xl transition-all duration-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:h-0 before:w-0 before:rounded-sm before:bg-black before:duration-300 before:ease-out hover:text-white hover:shadow-indigo-600 hover:before:h-40 hover:before:w-40 hover:before:opacity-80">
                  <Link to="/login"><span class="relative z-10">Sign in</span></Link>
                </button>
              )}
        </div>
        </div>
      </nav>
    
    <div className='flex'>
      
    <div className='w-1/3 min-h-screen pt-32 bg-gray-100'>
    <h1 className="text-3xl font-semibold text-center mb-4">Predict the price of your apartment</h1>
    <hr
        style={{
          height: "10px",
          border: "0",
          boxShadow: "0 10px 10px -10px #8c8b8b inset",
        }}
      />
    <form className="p-4 max-w-md mx-auto space-y-8 py-8 bg-gray-100">
    <div>
      <label className="block text-md font-medium mb-1">City</label>
      <div className="flex space-x-8">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="city"
            value="Warszawa"
            checked={form.city === "Warszawa"}
            onChange={handleCityChange}
            className="form-radio text-blue-500"
            
          />
          <span>Warszawa</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="city"
            value="Kraków"
            checked={form.city === "Kraków"}
            onChange={handleCityChange}
            className="form-radio text-blue-500"
          />
          <span>Kraków</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="city"
            value="Poznań"
            checked={form.city === "Poznań"}
            onChange={handleCityChange}
            className="form-radio text-blue-500"
          />
          <span>Poznań</span>
        </label>
      </div>
    </div>
    <div>
      <label className="block text-md font-medium">District</label>
      <select
        name="district"
        value={form.district || ""}
        onChange={handleChange}
        className="p-2 pt-1 bg-gray-100 border border-solid border-gray-400"
      >
        <option disabled value="">
          Choose dictrict
        </option>
        {districts.map((district, index) => (
          <option key={index} value={district}>
            {district}
          </option>
        ))}
      </select>
    </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Floor</label>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleDecrement('floor')} className="px-2 py-1 bg-gray-300 rounded-md">-</button>
            <input
            
              name="floor"
              value={form.floor}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-center"
            />
            <button type="button" onClick={() => handleIncrement('floor')} className="px-2 py-1 bg-gray-300 rounded-md">+</button>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">Rooms</label>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleDecrement('rooms')} className="px-2 py-1 bg-gray-300 rounded-md">-</button>
            <input
              type="number"
              name="rooms"
              value={form.rooms}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-center"
            />
            <button type="button" onClick={() => handleIncrement('rooms')} className="px-2 py-1 bg-gray-300 rounded-md">+</button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Square</label>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleDecrement('square')} className="px-2 py-1 bg-gray-300 rounded-md">-</button>
            <input
              type="number"
              name="square"
              value={form.square}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-center"
            />
            <button type="button" onClick={() => handleIncrement('square')} className="px-2 py-1 bg-gray-300 rounded-md">+</button>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">Year of construction</label>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleDecrement('year')} className="px-2 py-1 bg-gray-300 rounded-md">-</button>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-center"
            />
            <button type="button" onClick={() => handleIncrement('year')} className="px-2 py-1 bg-gray-300 rounded-md">+</button>
          </div>
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Prediction year</label>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleDecrement('prediction_year')} className="px-2 py-1 bg-gray-300 rounded-md">-</button>
            <input
              type="number"
              name="prediction_year"
              value={form.prediction_year}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-center"
            />
            <button type="button" onClick={() => handleIncrement('prediction_year')} className="px-2 py-1 bg-gray-300 rounded-md">+</button>
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">Prediction month</label>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleDecrement('prediction_month')} className="px-2 py-1 bg-gray-300 rounded-md">-</button>
            <input
              type="number"
              name="prediction_month"
              value={form.prediction_month}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-center"
            />
            <button type="button" onClick={() => handleIncrement('prediction_month')} className="px-2 py-1 bg-gray-300 rounded-md">+</button>
          </div>
        </div>
      </div>
      <button type="submit" onClick={handlePredict} className="w-full py-2 bg-blue-500 text-white rounded-md">Calculate</button>

    </form>
    </div>
    <div className='w-2/3 border-l p-8'>
    {history.map(record => {
        const isLatestRecord = new Date(record.search_date).getTime() === latestSearchDate;
        console.log(record)
        return (
          <div
            key={record.id}
            className={`main-box mb-4 border border-gray-400 rounded-xl pt-6 max-w-xl max-lg:mx-auto lg:max-w-full ${isLatestRecord ? 'border-green-500 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]' : ''}`} // Dodajemy zielony border dla najnowszego rekordu
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 pb-6 border-b border-gray-200">
              <div className="data">
                <p className="font-semibold text-base leading-7 text-black">
                  predictionID: <span className="text-orange-600 font-medium">{record.id}</span>
                </p>
                <p className="font-semibold text-base leading-7 text-black mt-4">
                  search date: <span className="text-gray-400 font-medium">{new Date(record.search_date).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="flex items-center mt-4 lg:mt-0">
                <p className="font-semibold text-base leading-7 text-black">
                  prediction at: <span className="text-orange-600 font-medium">{record.prediction_month}.{record.prediction_year}</span>
                </p>
              </div>
            </div>
            <div className="w-full px-3 min-[400px]:px-6">
              <div className="flex flex-col lg:flex-row items-center py-6 border-b border-gray-200 gap-6 w-full">
                <div className="img-box max-lg:w-full">
                  <img
                    src='https://images1.apartments.com/i2/PS6lbmQwWTKR6h8L6SZLTdbvd_pNyfZMp-zeXtDcU5E/116/post-chicago-il-4br-3br.jpg?p=1'
                    className="aspect-square w-full lg:max-w-[140px]"
                  />
                </div>
                <div className="flex flex-row items-center w-full">
                  <div className="grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 w-full">
                    <div className="flex items-center">
                      <div>
                        <h2 className="font-semibold text-2xl leading-8 text-black mb-3">
                          {record.city.charAt(0).toUpperCase() + record.city.slice(1).toLowerCase() + ', ' + 
                          record.district.split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')}
                        </h2>
                        <div className='flex items-center'>
                          <p className="font-medium text-base leading-7 text-black pr-4 mr-4 border-r border-gray-200">
                            square: <span className="text-orange-600">{record.square_meters}m<sup>2</sup></span>
                          </p>
                          <p className="font-medium text-base leading-7 text-black pr-4 mr-4 border-r border-gray-200">
                            rooms: <span className="text-orange-600">{record.rooms}</span>
                          </p>
                          <p className="font-medium text-base leading-7 text-black pr-4 mr-4 border-r border-gray-200">
                            floor: <span className="text-orange-600">{record.floor}</span>
                          </p>
                          <p className="font-medium text-base leading-7 text-black pr-4 mr-4 border-r border-gray-200">
                            year: <span className="text-orange-600">{record.year}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5">
                      <div className="col-span-5 lg:col-span-1 flex items-center max-lg:mt-3">
                        <div className="flex gap-3 lg:block">
                          <p className="font-medium text-sm leading-7 text-black">Price</p>
                          <div className="rounded-lg" style={{ maxWidth: '300px' }}>
                            <div className="">
                              <div
                                className="w-full h-4 rounded-full"
                                style={{
                                  background: 'linear-gradient(to right, green, yellow, red)',
                                }}
                              >
                                <div
                                  className="h-4 rounded-full"
                                  style={{
                                    width: `200px`,
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                  }}
                                />
                              </div>
                              <div className="mt-2 flex w-full justify-between">
                                <span className="text-sm text-gray-600">{record.suggested_price_min.toLocaleString('pl-PL')} zł</span>
                                <span className="text-sm text-gray-600">{record.suggested_price_max.toLocaleString('pl-PL')} zł</span>
                              </div>
                            </div>
                          </div>
                        </div>                      
                      </div>           
                    </div>
                    <div className='flex mt-8'>
                      <svg class="w-[42px] h-[42px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.1" d="M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667"/>
                      </svg>
                      <p
                        className={`mt-2 text-xl ${
                          record.percent >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {record.percent}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </div>
    </div>
  );
};

export default Account;