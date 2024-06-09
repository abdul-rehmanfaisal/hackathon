const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const dialogflow = require('@google-cloud/dialogflow');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const express = require("express");
var nodemailer = require('nodemailer');
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = "AIzaSyAwbaPFT8k16GmIOM3Xd-tbX-L8Q5N5Ss8";

async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // console.log(genAI)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 50,
    };

    const chat = model.startChat({
        generationConfig,
        history: [
        ],
    });

    const result = await chat.sendMessage(queryText);
    const response = result.response;
    return response.text();
}

const webApp = express();
const PORT = process.env.PORT || 5000;
webApp.use(express.urlencoded({
    extended: true
}));
webApp.use(express.json());
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});
webApp.get('/', (req, res) => {
    res.sendStatus(200);
    res.send("Status Okay")
});

webApp.post('/dialogflow', async (req, res) => {

    var id = (res.req.body.session).substr(43);
    console.log(id)
    const agent = new WebhookClient({
        request: req,
        response: res
    });

    async function fallback() {
        let action = req.body.queryResult.action;
        let queryText = req.body.queryResult.queryText;

        if (action === 'input.unknown') {
            let result = await runChat(queryText);
            agent.add(result);
            console.log(result)
        }else{
            agent.add(result);
            console.log(result)
        }

      

    }
    function hi(agent) {
        console.log(`intent  =>  hi`);
        agent.add('Hi, I am your SMIT virtual assistant, Tell me  your name')
    }
    function abcd(agent) {
        const { phonenumber ,name1 ,nic,course,  age ,date,geocity,geocountry, email} = agent.parameters;
       agent.add("email is sent and you are enrolled")
    
       var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'faisalabdulrehman97@gmail.com',
    pass: 'xkjwpnpwxuxegzhm'
  }
});

var mailOptions = {
  from: 'faisalabdulrehman97@gmail.com',
  to: 'asmaf610@gmail.com',
  subject: 'Congratulations on Your Current Enrollment!',
html:'<div style="border: 1000px;"><h1 style="text-align: center;">Congrats!</h1><img style="align-items: center; height: 10 rem;width: 30rem;" src="https://media.licdn.com/dms/image/D4D0BAQGD8npW7pZRLQ/company-logo_200_200/0/1684398542686?e=2147483647&v=beta&t=cxKn8F_pSgzn_3jv215dGJiM0ATx-S2EjSnxtJYR3XY"><p>Hi ${email} </p><br><p>I hope this email finds you in good spirits.</p><br><p style="text-align: center">Congratulations on being currently enrolled! Your commitment to your education is commendable, and I wanted to take a moment to acknowledge your dedication. Keep up the great work! If you ever need any assistance or have any questions, please donot hesitate to reach out. We are here to support you every step of the way.Wishing you continued success in your academic journey!</p></div>'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

     


}
    
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', hi);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('smit-portal',abcd );
    agent.handleRequest(intentMap);
});

webApp.listen(PORT, () => {
    console.log(`Server is up and running at http://localhost:${PORT}/`);
});
