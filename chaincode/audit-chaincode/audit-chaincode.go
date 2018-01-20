package main

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// SmartContract smart contract
type SmartContract struct {

}

// AuditLog audit log structure
type AuditLog struct {
  Action string `json:"action"`
  Time string `json:"time"`
  UserID string `json:"userId"`
}

// Init initialize smart contract
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

// Invoke invoke smart contract
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
  // Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()

  if function == "createLog" {
    return s.createLog(APIstub, args)
  } else if function == "getAllLogs" {
    return s.getAllLogs(APIstub)
  }

  return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) getAllLogs(APIstub shim.ChaincodeStubInterface) sc.Response {
  resultsIterator, err := APIstub.GetStateByRange("", "")
  if err != nil {
		return shim.Error(err.Error())
	}

  defer resultsIterator.Close()
  // buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")
  bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) createLog(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
  if len(args) != 4 {
    return shim.Error("Incorrect number of arguments. Expecting 4")
  }

  var log = AuditLog{Action: args[1], Time: args[2], UserID: args[3]}
  logAsBytes, _ := json.Marshal(log)
  APIstub.PutState(args[0], logAsBytes)
  return shim.Success(nil)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
