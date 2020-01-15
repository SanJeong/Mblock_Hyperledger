#!/bin/bash
instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n cc -v $version -p github.com/mblock
#chaincode instatiate
docker exec cli peer chaincode $instruction -n cc -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member")'
sleep 5
#chaincode invoke user1
docker exec cli peer chaincode invoke -n cc -C mychannel -c '{"Args":["addUser","user1","sanjeong"]}'
sleep 5
#chaincode query user1
docker exec cli peer chaincode query -n cc -C mychannel -c '{"Args":["readMedi","user1"]}'

#chaincode invoke add rating
docker exec cli peer chaincode invoke -n cc -C mychannel -c '{"Args":["addMedi","user1","20200101","타이레놀"]}'
sleep 5

echo '-------------------------------------END-------------------------------------'
