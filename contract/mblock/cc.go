package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type User struct{
	email string `json:"email"`
	Name string `json:"name"`
	Medi []Medi `json:"medi"`
}
type Medi struct{
	Date string  `json:"date"`
	Medicine string `json:"medicine"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()

	if function == "addUser" {
		return s.addUser(APIstub, args)
	} else if function == "addMedi" {
		return s.addMedi(APIstub, args)
	} else if function == "readMedi" {
		return s.readMedi(APIstub, args)
	} 
	return shim.Error("Invalid Smart Contract function name.")
}
 
func (s *SmartContract) addUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("fail!")
	}
	//이름중복체크
	//args[0] getstate 에 

	var user = User{email: args[0], Name: args[1]}
	userAsBytes, _ := json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) addMedi(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}
	// getState User 
	userAsBytes, err := APIstub.GetState(args[0])
	if err != nil{
		jsonResp := "\"Error\":\"Failed to get state for "+ args[0]+"\"}"
		return shim.Error(jsonResp)
	} else if userAsBytes == nil{ // no State! error
		jsonResp := "\"Error\":\"User does not exist: "+ args[0]+"\"}"
		return shim.Error(jsonResp)
	}
	// state ok
	user := User{}
	err = json.Unmarshal(userAsBytes, &user)
	if err != nil {
		return shim.Error(err.Error())
	}
	// create medi structure
	var Medi = Medi{Date: args[1], Medicine: args[2]}

	user.Medi=append(user.Medi,Medi)
	
	// update to User World state
	userAsBytes, err = json.Marshal(user);

	APIstub.PutState(args[0], userAsBytes)

	return shim.Success([]byte("rating is updated"))
}

func (s *SmartContract) readMedi(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	UserAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(UserAsBytes)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}