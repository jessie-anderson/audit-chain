package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// SmartContract smart contract
type SmartContract struct {
	LogID int `json:"logId"`
}

// AuditLog audit log structure
type AuditLog struct {
  ActionType string `json:"actionType"`
  Time string `json:"time"`
  UserID int `json:"userId"`
	PatientID int `json:"patientId"`
	DataType string `json:"dataType"`
	OriginalAuthorID int `json:"originalAuthorId"`
	DataField string `json:"dataField"`
	Data string `json:"data"`
	EntryMethod string `json:"entryMethod"`
	UserNPI int `json:"userNpi"`
	OriginalAuthorNPI int `json:"originalAuthorNpi"`
	OrganizationNPI int `json:"organizationNpi"`
}

// Init initialize smart contract
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	s.LogID = 0
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
  } else if function == "getLogById" {
		return s.getLogById(APIstub, args)
	} // else if function == "getLogsByPatient" {
	// 	return s.getLogsByPatient(APIstub)
	// } else if function == "getLogsByUser" {
	// 	return s.getLogsByUser(APIstub)
	// } else if function == "getLogsByDate" {
	// 	return s.getLogsByDate(APIstub)
	// } else if function == "getLogsByRecordID" {
	// 	return s.getLogsByRecordID(APIstub)
	// } else if function == "getLogsByActionType" {
	// 	return s.getLogsByActionType(APIstub)
	// }

  return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) createLog(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
  if len(args) != 12 {
    return shim.Error("Incorrect number of arguments. Expecting 12")
  }

	userId, userIdErr := strconv.Atoi(args[2])
	patientId, patientIdErr := strconv.Atoi(args[3])
	origAuthId, origAuthIdErr := strconv.Atoi(args[5])
	userNpi, userNpiErr := strconv.Atoi(args[9])
	origAuthNpi, origAuthNpiErr := strconv.Atoi(args[10])
	orgNpi, orgNpiErr := strconv.Atoi(args[11])

	if (userIdErr != nil) {
		return shim.Error(userIdErr.Error())
	}
	if (patientIdErr != nil) {
		return shim.Error(patientIdErr.Error())
	}
	if (origAuthIdErr != nil) {
		return shim.Error(origAuthIdErr.Error())
	}
	if (userNpiErr != nil) {
		return shim.Error(userNpiErr.Error())
	}
	if (origAuthNpiErr != nil) {
		return shim.Error(origAuthNpiErr.Error())
	}
	if (orgNpiErr != nil) {
		return shim.Error(orgNpiErr.Error())
	}

  log := AuditLog{ActionType: args[0], Time: args[1], UserID: userId, PatientID: patientId, DataType: args[4], OriginalAuthorID: origAuthId, DataField: args[6], Data: args[7], EntryMethod: args[8], UserNPI: userNpi, OriginalAuthorNPI: origAuthNpi, OrganizationNPI: orgNpi}
  logAsBytes, _ := json.Marshal(log)
  putErr := APIstub.PutState(fmt.Sprintf("%d", s.LogID), logAsBytes)
	if (putErr != nil) {
		return shim.Error(putErr.Error())
	}
	s.LogID = s.LogID + 1

	var buffer bytes.Buffer
	buffer.WriteString(fmt.Sprintf("%d", s.LogID))
  return shim.Success(logAsBytes)
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

	fmt.Printf("- getAllLogs:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) getLogById(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	res, err := APIstub.GetState(args[0])
	if (err != nil) {
		return shim.Error(err.Error())
	}

	return shim.Success(res)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
