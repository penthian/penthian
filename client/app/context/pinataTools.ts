
import { GATEWAY_URL, PINATA_JWT } from '../utils/constants';
import { PinataResponse } from './types';
import FormData from 'form-data';

export const uploadFileToIPFS = async (file: File): Promise<PinataResponse> => {
  try {
    //making axios POST request to Pinata ⬇️
    const formData: any = new FormData();
    formData.append('file', file);

    const request = await fetch(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`
        },
        body: formData
      }
    );
    const response = await request.json();
    return {
      success: true,
      pinataURL: GATEWAY_URL + response.IpfsHash
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
};




export const uploadJSONToIPFS = async (JSONBody: any): Promise<PinataResponse> => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  try {
    const request:any = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSONBody)
    });
    
    const response = await request.json();
    return {
      success: true,
      pinataURL: GATEWAY_URL + response.IpfsHash
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
