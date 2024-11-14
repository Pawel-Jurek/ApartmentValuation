import { AuthData } from '../auth/AuthWrapper';
import React from 'react';
import Img from '../assets/eee.jpg';
import axios from 'axios';

const Register = () => {

  const { register1 } = AuthData();
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const doRegister = async (e) => { 
    e.preventDefault();
    try {            
        await register1(formData.username, formData.email, formData.password, formData.password2);
    } catch (error) {   
           console.error('Error registering:', error.message);
    }         
 }

  return (
    <>
      <section class="bg-white overflow-hidden">
    <div class="grid grid-cols-1 lg:grid-cols-2">
        <div class="flex items-center justify-center px-4 py-10 bg-white  min-h-screen sm:px-6 lg:px-8 sm:py-16 lg:py-8">
            <div class="xl:w-full xl:max-w-sm 2xl:max-w-md xl:mx-auto">
                <h2 class="text-3xl font-bold leading-tight text-black sm:text-4xl">Sign up</h2>
                <p class="mt-2 text-base text-gray-600">Already have an account? <a href="/login" title="" class="font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 hover:underline focus:text-blue-700">Login</a></p>

                <form className="mt-8">
                <div className="space-y-5">
                  <div>
                    <label className="text-base font-medium text-gray-900">Username</label>
                    <div className="mt-2.5">
                      <input
                        type="text"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white caret-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-base font-medium text-gray-900">Email address</label>
                    <div className="mt-2.5">
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email to get started"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white caret-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-base font-medium text-gray-900">Password</label>
                    <div className="mt-2.5">
                      <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white caret-blue-600"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-base font-medium text-gray-900">Repeat your password</label>
                    <div className="mt-2.5">
                      <input
                        type="password"
                        name="password2"
                        placeholder="Enter your password again"
                        value={formData.password2}
                        onChange={handleChange}
                        className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-blue-600 focus:bg-white caret-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input type="checkbox" name="agree" id="agree" className="w-5 h-5 text-blue-600 bg-white border-gray-200 rounded" required />
                    <label htmlFor="agree" className="ml-3 text-sm font-medium text-gray-500">
                      I agree to <a href="#" title="" className="text-blue-600 hover:text-blue-700 hover:underline">Terms of Service</a> and <a href="#" title="" className="text-blue-600 hover:text-blue-700 hover:underline">Privacy Policy</a>
                    </label>
                  </div>

                  <div>
                    <button onClick={doRegister} type="submit" className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md focus:outline-none hover:bg-blue-700 focus:bg-blue-700">
                      Create free account
                    </button>
                  </div>
                </div>
              </form>

                
            </div>
        </div>

        <div class="flex items-center justify-center px-4 py-10 sm:py-16 lg:py-24 bg-gray-50 sm:px-6 lg:px-8">
            <div>              
                <img class="rounded-full ml-44" src={Img} alt="" />        
            </div>
        </div>
    </div>
</section>

    

    </>
  );
};

export default Register;