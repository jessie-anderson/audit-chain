package main

import (
  // "bytes"
	"encoding/json"
	// "strconv"
  "fmt"
  // "crypto/sha256"
  // "crypto/rsa"
  // "crypto/rand"
  // "math/big"
  // "encoding/binary"
	"strings"
  // "reflect"
  "errors"

	// "github.com/hyperledger/fabric/bccsp"
	// "github.com/hyperledger/fabric/bccsp/factory"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

/** EventDetails
	* ActionType: edit, delete, create, view
	* Time: time of action
	* UserID: id of user who performed action
	* PatientID: id of patient whose record is concerned
	* DataType: data type of record, e.g. chart
	* OriginalAuthorID: id of user who authored the change (in case of make-me-the-author funcitonality)
	* DataField: name of field modified in this LogEntry
	* Data: new value of DataField
	* EntryMethod: manual, auto-fill, dictation, etc.
	* UserNPI: National Provider Identity of user performing action
	* OriginalAuthorNPI: NPI of user who authored change (in case of make-me-the-author functionality)
	* OrganizationNPI: NPI of organization that user belongs to
**/

type EventDetails struct {
	ActionType string `json:"actionType"`
  Time string `json:"time"`
  UserID string `json:"userId"`
	PatientID string `json:"patientId"`
	DataType string `json:"dataType"`
	OriginalAuthorID string `json:"originalAuthorId"`
	DataField string `json:"dataField"`
	Data string `json:"data"`
	EntryMethod string `json:"entryMethod"`
	UserNPI string `json:"userNpi"`
	OriginalAuthorNPI string `json:"originalAuthorNpi"`
	OrganizationNPI string `json:"organizationNpi"`
}

type Entry struct {
  Update EventDetails `json:"update"`
  // RecordHash [32]byte `json:"recordHash"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
  return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
  fn, args := APIstub.GetFunctionAndParameters()

	// if transientErr != nil {
	// 	return shim.Error(fmt.Sprintf("Error getting transient map: %+v", transientErr))
	// }

	if fn == "recordUpdate" {
		return s.RecordUpdate(APIstub, args)
	} else if fn == "getRecordHistory" {
		return s.GetRecordHistory(APIstub, args)
	}

	return shim.Error(fmt.Sprintf("Unrecognized function %s", fn))
}

func (s *SmartContract) GetCreator(APIstub shim.ChaincodeStubInterface) sc.Response {
	creator, creatorErr := APIstub.GetCreator()
	if creatorErr != nil {
		return shim.Error(fmt.Sprintf("%+v", creatorErr))
	}
	return shim.Success(creator)
}

func (s *SmartContract) RecordUpdate(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 13 {
		return shim.Error(fmt.Sprintf("Expecting 13 arguments; got %d", len(args)))
	}

	eventDetails, detailsErr := s.CreateEventDetails(args[1:])
	if (detailsErr != nil) {
		return shim.Error(fmt.Sprintf("%+v", detailsErr))
	}

	event := Entry{Update: eventDetails}
	eventAsBytes, eventMarshalErr := json.Marshal(event)
	if eventMarshalErr != nil {
		return shim.Error(fmt.Sprintf("Error marshaling event: %+v", eventMarshalErr))
	}
	APIstub.PutState(args[0], eventAsBytes)
	return shim.Success([]byte("successfully updated ledger"))
}

func (s *SmartContract) CreateEventDetails(args []string) (EventDetails, error) {
	details := map[string]string{}
	for i := 0; i < len(args); i++ {
		pieces := strings.Split(args[i], ":")
		if len(pieces) != 2 {
			return EventDetails{}, errors.New(fmt.Sprintf("Incorrectly formatted argument %s", args[i]))
		}
		if s.IsValidField(pieces[0]) {
			details[pieces[0]] = pieces[1]
		} else {
			return EventDetails{}, errors.New(fmt.Sprintf("Invalid field %s", pieces[0]))
		}
	}
	marshaled, marshalErr := json.Marshal(details)
	if marshalErr != nil {
		return EventDetails{}, errors.New(fmt.Sprintf("Error marshaling map: %+v", marshalErr))
	}
	eventDetails := EventDetails{}
	unmarshalErr := json.Unmarshal(marshaled, &eventDetails)
	if unmarshalErr != nil {
		return eventDetails, errors.New(fmt.Sprintf("Error unmarshaling into EventDetails: %+v", unmarshalErr))
	}
	return eventDetails, nil
}

func (s *SmartContract) IsValidField(field string) bool {
	switch field {
		case
		"actionType", "time", "userId", "patientId", "dataType", "originalAuthorId",
		"dataField", "data", "entryMethod", "userNpi", "originalAuthorNpi",
		"organizationNpi":
		return true
	}
	return false
}

func (s *SmartContract) GetRecordHistory(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error(fmt.Sprintf("Expecting 1 argument; got %d", len(args)))
	}
	historyIter, historyErr := APIstub.GetHistoryForKey(args[0])
	if historyErr != nil {
		return shim.Error(historyErr.Error())
	}
	var historyItems [][]byte
	for historyIter.HasNext() {
		item, err := historyIter.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		itemAsBytes, bytesErr := json.Marshal(item)
		if bytesErr != nil {
			return shim.Error(bytesErr.Error())
		}
		historyItems = append(historyItems, itemAsBytes)
	}
	historyAsBytes, marshalErr := json.Marshal(historyItems)
	if marshalErr != nil {
		return shim.Error(marshalErr.Error())
	}
	return shim.Success(historyAsBytes)
}

// func (s *SmartContract) EncryptAndPut(APIstub shim.ChaincodeStubInterface, args []string, nByteArr []byte, eByteArr []byte) sc.Response {
//   if len(args) != 3 {
//     return shim.Error(fmt.Sprintf("Expecting 3 args; got %d", len(args)))
//   }
//
//   // TODO: add check that hash of previous record matches
//
//   recordId := args[0]
//   prevRecord := []byte(args[1])
//   updates := []byte(args[2])
//   n := new(big.Int).SetBytes(nByteArr)
//
//   // TODO: do I need to worry about _, which is # bytes read from binary.Varint?
//   e, _ := binary.Varint(eByteArr)
//   eInt := int(e)
//   encKey := rsa.PublicKey{N: n, E: eInt}
//
//   prevRecordMap := map[string]string{}
//   updatesMap := map[string]string{}
//
//   recordErr := json.Unmarshal(prevRecord, &prevRecordMap)
//   if recordErr != nil {
//     return shim.Error(fmt.Sprintf("Error unmarshaling previous record: %+v", recordErr))
//   }
//   updatesErr := json.Unmarshal(updates, &updatesMap)
//   if updatesErr != nil {
//     return shim.Error(fmt.Sprintf("Error unmarshaling updates: %+v", updatesErr))
//   }
//
//   // TODO: is "updates" the best label?
//   encryptedUpdates, encryptErr := rsa.EncryptOAEP(sha256.New(), rand.Reader, &encKey, updates, []byte("updates"))
//   if encryptErr != nil {
//     return shim.Error(fmt.Sprintf("Error encrypting value: %+v", encryptErr))
//   }
//
//   updatedRecordMap := updateRecord(prevRecordMap, updatesMap)
//   updatedRecord, marshalErr := json.Marshal(updatedRecordMap)
//   if marshalErr != nil {
//     return shim.Error(fmt.Sprintf("Error marshaling updated record: %+v", marshalErr))
//   }
//
//   updatedHash := sha256.Sum256(updatedRecord)
//   stateUpdate := Entry{Updates: encryptedUpdates, RecordHash: updatedHash}
//   updateAsBytes, marshalErr2 := json.Marshal(stateUpdate)
//   if marshalErr2 != nil {
//     return shim.Error(fmt.Sprintf("Error marshaling state update: %+v", marshalErr2))
//   }
//
//   APIstub.PutState(recordId, updateAsBytes)
//   return shim.Success(nil)
// }
//
// func updateRecord(prevRecordMap map[string]string, updatesMap map[string]string) map[string]string {
//   updatedRecord := map[string]string{}
//   for k, v := range prevRecordMap {
//     if val, in := updatesMap[k]; in {
//       updatedRecord[k] = val
//     } else {
//       updatedRecord[k] = v
//     }
//     updatedRecord[k] = v
//   }
//
//   return updatedRecord
// }

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
