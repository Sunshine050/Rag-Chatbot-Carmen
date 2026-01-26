import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const chatWithAI = async (query: string) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { query });
    return response.data;
  } catch (error) {
    console.error('Error calling Backend API:', error);
    throw error;
  }
};
