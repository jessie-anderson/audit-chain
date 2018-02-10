package main

import (
  // "bytes"
	"encoding/json"
	// "strconv"
  "fmt"
  "crypto/sha256"
  "crypto/rsa"
  "crypto/rand"
  "math/big"
  "encoding/binary"
  // "reflect"
  // "errors"

	// "github.com/hyperledger/fabric/bccsp"
	// "github.com/hyperledger/fabric/bccsp/factory"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type Entry struct {
  Updates []byte `json:"updates"`
  RecordHash [32]byte `json:"recordHash"`
}

const ENCKEY = "ENCKEY"

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
  return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
  fn, args := APIstub.GetFunctionAndParameters()
  tMap, transientErr := APIstub.GetTransient()

  if transientErr != nil {
    return shim.Error(fmt.Sprintf("Transient payload could not be retrieved: %+v", transientErr))
  }

  switch fn {
  case "EncryptAndPut":
    if _, in := tMap["N"]; !in {
      return shim.Error("Encryption key field N not found in transient")
    }
    if _, in := tMap["E"]; !in {
      return shim.Error("Encryption key field E not found in transient")
    }
    return s.EncryptAndPut(APIstub, args, tMap["N"], tMap["E"])
  default:
    return shim.Error(fmt.Sprintf("Unrecognized function %s", fn))
  }
}

func (s *SmartContract) EncryptAndPut(APIstub shim.ChaincodeStubInterface, args []string, nByteArr []byte, eByteArr []byte) sc.Response {
  if len(args) != 3 {
    return shim.Error(fmt.Sprintf("Expecting 3 args; got %d", len(args)))
  }

  // TODO: add check that hash of previous record matches

  recordId := args[0]
  prevRecord := []byte(args[1])
  updates := []byte(args[2])
  n := new(big.Int).SetBytes(nByteArr)

  // TODO: do I need to worry about _, which is # bytes read from binary.Varint?
  e, _ := binary.Varint(eByteArr)
  eInt := int(e)
  encKey := rsa.PublicKey{N: n, E: eInt}

  prevRecordMap := map[string]string{}
  updatesMap := map[string]string{}

  recordErr := json.Unmarshal(prevRecord, &prevRecordMap)
  if recordErr != nil {
    return shim.Error(fmt.Sprintf("Error unmarshaling previous record: %+v", recordErr))
  }
  updatesErr := json.Unmarshal(updates, &updatesMap)
  if updatesErr != nil {
    return shim.Error(fmt.Sprintf("Error unmarshaling updates: %+v", updatesErr))
  }

  // TODO: is "updates" the best label?
  encryptedUpdates, encryptErr := rsa.EncryptOAEP(sha256.New(), rand.Reader, &encKey, updates, []byte("updates"))
  if encryptErr != nil {
    return shim.Error(fmt.Sprintf("Error encrypting value: %+v", encryptErr))
  }

  updatedRecordMap := updateRecord(prevRecordMap, updatesMap)
  updatedRecord, marshalErr := json.Marshal(updatedRecordMap)
  if marshalErr != nil {
    return shim.Error(fmt.Sprintf("Error marshaling updated record: %+v", marshalErr))
  }

  updatedHash := sha256.Sum256(updatedRecord)
  stateUpdate := Entry{Updates: encryptedUpdates, RecordHash: updatedHash}
  updateAsBytes, marshalErr2 := json.Marshal(stateUpdate)
  if marshalErr2 != nil {
    return shim.Error(fmt.Sprintf("Error marshaling state update: %+v", marshalErr2))
  }

  APIstub.PutState(recordId, updateAsBytes)
  return shim.Success(nil)
}

func updateRecord(prevRecordMap map[string]string, updatesMap map[string]string) map[string]string {
  updatedRecord := map[string]string{}
  for k, v := range prevRecordMap {
    if val, in := updatesMap[k]; in {
      updatedRecord[k] = val
    } else {
      updatedRecord[k] = v
    }
    updatedRecord[k] = v
  }

  return updatedRecord
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
