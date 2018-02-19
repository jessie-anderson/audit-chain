package main

import (
  "fmt"
  "github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct{}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
  return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
  fn, args := APIstub.GetFunctionAndParameters()
  if (fn == "getState") {
    return s.GetState(APIstub, args)
  } else {
    return shim.Error(fmt.Sprintf("Unrecognized function %s", fn))
  }
}

func (s *SmartContract) GetState(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
  if (len(args) < 1) {
    return shim.Error("Need at least 1 argument")
  }
  res, err := APIstub.GetState(args[0])
  if err != nil {
    return shim.Error(fmt.Sprintf("Error getting state for key %s: %+v", args[0], err))
  }
  return shim.Success([]byte(res)])
}

func main() {
  err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
