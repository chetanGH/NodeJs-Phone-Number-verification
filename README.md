# NodeJs-Phone-Number-verification
Nodejs-express api to validate the phone numbers

# UI
FrontEnd folder contains Angular UI code for verification of Signup and OTP verification and regenerate otp.
 ### Prerequisites
 Install the dependencies 
 ```
 cd FrontEnd
 ```
 than
 
 ```
 npm install && ng serve
 ```
 
 Access it on http://localhost:4200
 
 
# SERVER
  Server folder contains Express code for BackEnd REST APIS
  ### Prerequisites

Install the dependencies 

```
npm install
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

add Mongodb_url in /model/connection.js. incase you're usin atlas. Here i used localdb

```
mongoose.connect('HERE', {useNewUrlParser: true,useUnifiedTopology: true });
```

```
then do 
```
sls offline start
```

SERVER
