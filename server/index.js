import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import 'dotenv/config';

import fetch from 'node-fetch'; // npm install node-fetch
import OpenAI from "openai";

const app = express();
const port = 8000;

app.use(bodyParser.json());
 
const API_KEY = process.env.PLACES_API; // Replace 'YOUR_API_KEY' with your actual API key
const mlkey=process.env.GPT_API;

// Initialize the OpenAI client with your API key
const openai = new OpenAI({apiKey:mlkey});
const position={
    longitude:"",
    latitude:""
}
let hospitaldata=[
  

]



app.post('/gethospitals', async (req, res) => {
    console.log("helo");
    const { latitude, longitude } = req.body;
    position.latitude=latitude;
    position.longitude=longitude;
    const response = await fetch(`https://api.geoapify.com/v2/places?categories=healthcare&filter=circle:${longitude},${latitude},5000&bias=proximity:${longitude},${latitude}&limit=30&apiKey=${API_KEY}`);
    const data = await response.json(); 
    console.log(data);
    for(let i=0;i<data.features.length;i++){
hospitaldata[i]={};
        hospitaldata[i].hospitalname=data.features[i].properties.name;
        hospitaldata[i].postcode=data.features[i].properties.postcode;
        hospitaldata[i].street=data.features[i].properties.street;
        hospitaldata[i].addressline1=data.features[i].properties.address_line1;
        hospitaldata[i].addressline2=data.features[i].properties.address_line2;
        hospitaldata[i].distance=data.features[i].properties.distance;
       
    }
    
      
  
    res.json(hospitaldata);
});
app.post("/tochatgpt", async (req, res) => {
   const prob = req.body.problem;
    console.log(prob);
    console.log("hello");
    const completion = await openai.chat.completions.create({
        messages: [{"role": "system", "content": "Give me a specialization for the mentioned problem from the following options that i have mentioned only because I need it to incorporate in my API  :(healthcare.clinic_or_praxis, healthcare.clinic_or_praxis.allergology, healthcare.clinic_or_praxis.vascular_surgery, healthcare.clinic_or_praxis.urology, healthcare.clinic_or_praxis.trauma, healthcare.clinic_or_praxis.rheumatology, healthcare.clinic_or_praxis.radiology, healthcare.clinic_or_praxis.pulmonology, healthcare.clinic_or_praxis.psychiatry, healthcare.clinic_or_praxis.paediatrics, healthcare.clinic_or_praxis.otolaryngology, healthcare.clinic_or_praxis.orthopaedics, healthcare.clinic_or_praxis.ophthalmology, healthcare.clinic_or_praxis.occupational, healthcare.clinic_or_praxis.gynaecology, healthcare.clinic_or_praxis.general, healthcare.clinic_or_praxis.gastroenterology, healthcare.clinic_or_praxis.endocrinology, healthcare.clinic_or_praxis.dermatology, healthcare.clinic_or_praxis.cardiology, healthcare.dentist, healthcare.dentist.orthodontics, healthcare.hospital, healthcare.pharmacy). for example: My probem is leg injury. Your answer should be: healthcare.clinic_or_praxis.orthopaedics please provide the branch of hospital from the given list only not outside from this so Now my problem is:"+prob}],
        model: "gpt-3.5-turbo",
      });
    
      console.log(completion.choices[0]);
      let branch=(completion.choices[0].message.content);
      const response = await fetch(`https://api.geoapify.com/v2/places?categories=${branch}&filter=circle:${position.longitude},${position.latitude},10000&bias=proximity:${position.longitude},${position.latitude}&limit=20&apiKey=${API_KEY}`);
      let data = await response.json(); 
     

     if(!data.features)
        {
            console.log("urinary");
        const response = await fetch(`https://api.geoapify.com/v2/places?categories=healthcare&filter=circle:${position.longitude},${position.latitude},10000&bias=proximity:${position.longitude},${position.latitude}&limit=20&apiKey=${API_KEY}`);
        data = await response.json();
        for(let i=0;i<data.features.length;i++){
            hospitaldata[i]={};
                    hospitaldata[i].hospitalname=data.features[i].properties.name;
                    hospitaldata[i].postcode=data.features[i].properties.postcode;
                    hospitaldata[i].street=data.features[i].properties.street;
                    hospitaldata[i].addressline1=data.features[i].properties.address_line1;
                    hospitaldata[i].addressline2=data.features[i].properties.address_line2;
                    hospitaldata[i].distance=data.features[i].properties.distance;
                   
                }
                console.log(hospitaldata);
         res.json(hospitaldata);
        }    
      else{
    
        hospitaldata=[];
    for(let i=0;i<data.features.length;i++){
hospitaldata[i]={};
        hospitaldata[i].hospitalname=data.features[i].properties.name;
        hospitaldata[i].postcode=data.features[i].properties.postcode;
        hospitaldata[i].street=data.features[i].properties.street;
        hospitaldata[i].addressline1=data.features[i].properties.address_line1;
        hospitaldata[i].addressline2=data.features[i].properties.address_line2;
        hospitaldata[i].distance=data.features[i].properties.distance;
       
    }}

    
   

    console.log(JSON.stringify(hospitaldata));
    res.json(hospitaldata);
  
  
  
    
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});