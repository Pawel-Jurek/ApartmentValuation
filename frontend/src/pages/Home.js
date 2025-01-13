import React, { useEffect, useRef } from 'react';
import Img from '../assets/bck.jpg';
import Header from '../components/Header';
import { AuthData } from '../auth/AuthWrapper';
import { Link } from 'react-router-dom';
import axiosInstance from '../auth/axiosSetup';

const Home = () => {

  const howItWorks = useRef(null);
  const top = useRef(null);
  const about = useRef(null);
  const contact = useRef(null);

  const {user} = AuthData();

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [data, setData] = React.useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('http://localhost:8000/valuation/get-home-data/');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  

  return (
    <>
      <Header
        scrollToSection={scrollToSection} 
        refs={{ top, howItWorks, about, contact }}  
      />

      <div className="pt-18 min-h-screen flex justify-center items-center">
        <div className="w-screen h-screen bg-cover bg-center bg-no-repeat bg-[image:var(--image-url)]" style={{ '--image-url': `url(${Img})` }}>

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/10 pointer-events-none"></div>
          
          <div ref={top} className="w-full min-h-screen flex flex-col justify-center items-center p-32">
            <h1 className="mt-32 text-4xl pb-4 font-bold text-white tracking-widest">Apartment Valuation</h1>
            
            {user.isAuthenticated ? (
              <>
              <Link to='/account'>
                <button 
                className="mb-40 relative h-12 w-40 overflow-hidden border border-white text-white shadow-2xl transition-all before:absolute before:top-1/2 before:h-0 before:w-64 before:origin-center before:-translate-x-20 before:rotate-45 before:bg-white before:duration-300 hover:text-black hover:shadow-white hover:before:h-64 hover:before:-translate-y-32"
              >
                <span className="relative z-10">TRY IT</span>
              </button>
              </Link>
              </>
            ) : (
              <>
              <Link to='/login'>
                <button 
                className="mb-40 relative h-12 w-40 overflow-hidden border border-white text-white shadow-2xl transition-all before:absolute before:top-1/2 before:h-0 before:w-64 before:origin-center before:-translate-x-20 before:rotate-45 before:bg-white before:duration-300 hover:text-black hover:shadow-white hover:before:h-64 hover:before:-translate-y-32"
              >
                <span className="relative z-10">TRY IT</span>
              </button>
              </Link>
              </>
            )}
            

            <svg onClick={() => scrollToSection(howItWorks)} className="w-[44px] h-[44px] text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4" d="m19 9-7 7-7-7"/>
            </svg>
          </div>

          <div ref={howItWorks} className="w-full min-h-screen bg-white flex justify-center items-center">
            <section className="py-10 bg-white sm:py-16 lg:py-24">
              <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="max-w-2xl mx-auto text-center">
              <h2
                className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                style={{
                  color: '#444444',
                  background: '#FFFFFF',
                  textShadow: '1px 0px 1px #CCCCCC, 0px 1px 1px #EEEEEE, 2px 1px 1px #CCCCCC, 1px 2px 1px #EEEEEE, 3px 2px 1px #CCCCCC, 2px 3px 1px #EEEEEE, 4px 3px 1px #CCCCCC, 3px 4px 1px #EEEEEE, 5px 4px 1px #CCCCCC, 4px 5px 1px #EEEEEE, 6px 5px 1px #CCCCCC, 5px 6px 1px #EEEEEE, 7px 6px 1px #CCCCCC'
                }}
              >
                How does it work?
              </h2>
            </div>


                <div className="mt-12 lg:mt-20">
                  <div className="grid grid-cols-1 text-center gap-y-12 md:grid-cols-3 gap-x-12">
                    <div>
                      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                        <span className="text-xl font-semibold text-gray-700">1</span>
                      </div>
                      <h3 className="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Create an Account</h3>
                      <p className="mt-4 text-base text-gray-600">
                        Sign up by filling out a simple form with your details.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                        <span className="text-xl font-semibold text-gray-700">2</span>
                      </div>
                      <h3 className="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Set Parameters</h3>
                      <p className="mt-4 text-base text-gray-600">
                        Define the necessary parameters to get an accurate property evaluation.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-white border-2 border-gray-200 rounded-full shadow">
                        <span className="text-xl font-semibold text-gray-700">3</span>
                      </div>
                      <h3 className="mt-6 text-xl font-semibold leading-tight text-black md:mt-10">Estimate the Property</h3>
                      <p className="mt-4 text-base text-gray-600">
                        Estimate the property value both for the current time and future projections.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <hr ref={about}/><hr/><hr/>
          <div className='flex w-full min-h-screen justify-center pt-64'>
              <section class="bg-white ">
                <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div class="text-center">
                    <h2
                      className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                      style={{
                        color: '#444444',
                        background: '#FFFFFF',
                        textShadow: '1px 0px 1px #CCCCCC, 0px 1px 1px #EEEEEE, 2px 1px 1px #CCCCCC, 1px 2px 1px #EEEEEE, 3px 2px 1px #CCCCCC, 2px 3px 1px #EEEEEE, 4px 3px 1px #CCCCCC, 3px 4px 1px #EEEEEE, 5px 4px 1px #CCCCCC, 4px 5px 1px #EEEEEE, 6px 5px 1px #CCCCCC, 5px 6px 1px #EEEEEE, 7px 6px 1px #CCCCCC'
                      }}
                    >About
                    </h2>
                        <h4 class="text-xl font-medium text-gray-900">My application in numbers</h4>
                    </div>

                    <div class="grid grid-cols-1 gap-6 px-6 mt-8 sm:px-0 lg:mt-16 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-12">
                        <div class="overflow-hidden bg-white border border-gray-200 rounded-lg">
                            <div class="px-4 py-6">
                                <div class="flex items-start">
                                    <svg class="flex-shrink-0 w-12 h-12 text-fuchsia-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <div class="ml-4">
                                        <h4 class="text-4xl font-bold text-gray-900">{data.valuations_count}</h4>
                                        <p class="mt-1.5 text-lg font-medium leading-tight text-gray-500">Valuation counts</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-hidden bg-white border border-gray-200 rounded-lg">
                            <div class="px-4 py-6">
                                <div class="flex items-start">
                                    <svg class="flex-shrink-0 w-12 h-12 text-fuchsia-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <div class="ml-4">
                                        <h4 class="text-4xl font-bold text-gray-900">{data.users_count}+</h4>
                                        <p class="mt-1.5 text-lg font-medium leading-tight text-gray-500">Registered users</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-hidden bg-white border border-gray-200 rounded-lg">
                            <div class="px-4 py-6">
                                <div class="flex items-start">
                                    <svg class="flex-shrink-0 w-12 h-12 text-fuchsia-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div class="ml-4">
                                        <h4 class="text-4xl font-bold text-gray-900">3 Cities</h4>
                                        <p class="mt-1.5 text-lg font-medium leading-tight text-gray-500">Warszawa, Kraków and Poznań</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-hidden bg-white border border-gray-200 rounded-lg">
                            <div class="px-4 py-6">
                                <div class="flex items-start">
                                    <svg class="flex-shrink-0 w-12 h-12 text-fuchsia-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="1"
                                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                        />
                                    </svg>
                                    <div class="ml-4">
                                        <h4 class="text-4xl font-bold text-gray-900">~92%</h4>
                                        <p class="mt-1.5 text-lg font-medium leading-tight text-gray-500">Model effectiveness</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-center mt-64'>
                      <svg
                        onClick={() => scrollToSection(top)}
                       class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 15 7-7 7 7"/>
                      </svg>
                    </div>

                </div>
            </section>

          </div>
      
        </div>
      </div>
    </>
  );
};

export default Home;
