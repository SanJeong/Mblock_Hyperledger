// 외부모듈 추가
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
//하이퍼레져 연결부설정
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

//서버변수 설정 
const PORT = 8080;
const HOST = '0.0.0.0';

// app.use 설정 
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Get / 라우팅
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

async function cc_call(fn_name, args){
    
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('cc');

    var result;
    
    if(fn_name == 'addUser')
        result = await contract.submitTransaction('addUser', args[0], args[1]);
    else if( fn_name == 'addMedi')
        result = await contract.submitTransaction('addMedi', args[0], args[1], args[2]);
    else if(fn_name == 'readMedi')
        result = await contract.evaluateTransaction('readMedi', args);
    else
        result = 'not supported function'

    return result;
}

app.post('/addUser', async(req, res)=>{
    const email = req.body.email;
    const name = req.body.name;
    console.log("add mate email: " + email);
    console.log("add mate name: " + name);

    var args=[email,name]
    result = cc_call('addUser', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

app.post('/addMedi', async(req, res)=>{
    const email = req.body.email;
    const date = req.body.date;
    const medicine = req.body.medicine;
    console.log("email: " + email);
    console.log("add date: " + date);
    console.log("medicine: " + medicine);

    var args=[email, date, medicine];
    result = cc_call('addMedi', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

app.post('/readMedi/:email', async (req,res)=>{
    const email = req.body.email;
    console.log("email: " + req.body.email);
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('cc');
    const result = await contract.evaluateTransaction('readMedi', email);
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
    // res.status(200).json(result)

});


//서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);