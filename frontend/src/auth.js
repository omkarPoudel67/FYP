import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

export const loginUser = async(username, password) =>{
    try{
        const response = await axios.post(`${BASE_URL}/login/`,{
            username,
             password
        });
        return response.data;
        
    }catch(error){
        return {success: false, message: error.response.data.message }
    }
};