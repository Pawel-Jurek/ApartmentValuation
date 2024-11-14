
import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { AuthData } from '../auth/AuthWrapper';
import { toast } from "react-toastify";

const Account = () => {

  const {user} = AuthData();
  const [errorMessage, setErrorMessage] = useState("");
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({
    city: '',
    district: '',
    square: 45,
    rooms:3,
    floor: 2,
    year: 1999,
    prediction_year: 2024,
    prediction_month: 11,
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/users/searches/', {
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
    if (prediction_year < new Date().getFullYear() || prediction_year > new Date().getFullYear() + 100) {
      toast.error("Prediction year must be between 1900 and 2070.", { position: 'top-left' });
      return;
    }
    if (prediction_month < 1 || prediction_month > 12) {
      toast.error("Prediction month must be between 1 and 12.", { position: 'top-left' });
      return;
    }
  
    setErrorMessage("");
  
    try {
      const response = await axios.post(
        'http://localhost:8000/valuation/', 
        { 
          sq: square,
          district: district,
          city: city,
          floor: floor,
          rooms: rooms,
          year: year,
          prediction_year: prediction_year,
          prediction_month: prediction_month,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      );
  
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
  
      if (field === "prediction_month" && newValue > 12) newValue = 12;
      if (field === "prediction_year" && newValue > 2070) newValue = 2070;
      if (field === "floor" && newValue > 100) newValue = 100;
      if (field === "rooms" && newValue > 10) newValue = 10;
      if(field === "square" && newValue > 500) newValue = 500;
      if(field === "year" && newValue > 2024) newValue = 2024;
  
      return { ...prevForm, [field]: newValue };
    });
  };
  
  const handleDecrement = (field) => {
    setForm((prevForm) => {
      let newValue = prevForm[field] - 1;
  
      if (field === "prediction_month" && newValue < 1) newValue = 1;
      if (field === "prediction_year" && newValue < 1900) newValue = 1900;
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
  
    axios.get('http://localhost:8000/valuation/addresses/'+city+'/')
      .then(response => {      
        setDistricts(response.data.addresses);
        
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
      });

  };


  return (

    <div className='flex'>
      <a href='/' className='p-4'>
        <svg class="w-[42px] h-[42px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
        </svg>
      </a>
    <div className='w-1/3 min-h-screen pt-32'>
    <h1 className="text-3xl font-semibold text-center mb-4">Predict the price of your apartment</h1>
    <form className="p-4 max-w-md mx-auto space-y-8 py-8 bg-gray-200 rounded-lg">
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
          <span>Warsaw</span>
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
          <span>Cracow</span>
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
          <span>Poznan</span>
        </label>
      </div>
    </div>
    <div>
      <label className="block text-md font-medium">District</label>
      <select
        name="district"
        value={form.district || ""}
        onChange={handleChange}
        className="bg-gray-200 pt-1"
      >
        <option disabled value="">
          Choose neighbourhood
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
                          {record.city + ', ' + record.district}
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
                                <span className="text-sm text-gray-600">{record.suggested_price_min} zł</span>
                                <span className="text-sm text-gray-600">{record.suggested_price_max} zł</span>
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
  );
};

export default Account;