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

// Get /query 라우팅
app.post('/query', async (req, res)=>{
    const key = req.body.key;

    //wallet info
    console.log("key: " + req.body.key);
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

    //체인코드 접속
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('sacc');

    //체인코드 콜
    const result = await contract.evaluateTransaction('get', key);

    //웹 클라이언트에  전송
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
})

// Get /invoke 라우팅
app.post('/invoke', async (req, res)=>{
    const key = req.body.key;
    const value = req.body.value;

    //wallet info
    console.log("key: " + key);
    console.log("val: " + value);
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

    //체인코드 접속
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('sacc');

    //체인코드 콜
    const result = await contract.submitTransaction('set', key, value);

    //웹 클라이언트에  전송
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
})


//서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);