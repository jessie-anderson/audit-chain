package main

import (
  "bytes"
	"encoding/json"
  "fmt"
	"strings"
  "errors"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

/** EventDetails
	* ActionType: edit, delete, create, view
	* UserID: id of user who performed action
	* PatientID: id of patient whose record is concerned
	* DataType: data type of record, e.g. chart
	* OriginalAuthorID: id of user who authored the change (in case of make-me-the-author funcitonality)
	* DataField: name of field modified in this LogEntry
	* Data: new value of DataField (potentially encrypted?)
	* EntryMethod: manual, auto-fill, dictation, etc.
	* UserNPI: National Provider Identity of user performing action
	* OriginalAuthorNPI: NPI of user who authored change (in case of make-me-the-author functionality)
	* OrganizationNPI: NPI of organization that user belongs to
**/

type EventDetails struct {
	ActionType string `json:"actionType"`
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

	if fn == "recordUpdate" {
		return s.RecordUpdate(APIstub, args)
	} else if fn == "getRecordHistory" {
		return s.GetRecordHistory(APIstub, args)
	} else if fn == "getCreator" {
    return s.GetCreator(APIstub)
  } else if fn == "getLogQueryResult" {
    return s.GetLogQueryResult(APIstub, args)
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
	if len(args) != 12 {
		return shim.Error(fmt.Sprintf("Expecting 12 arguments; got %d", len(args)))
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
		"actionType", "userId", "patientId", "dataType", "originalAuthorId",
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

	var buffer bytes.Buffer
	buffer.WriteString("[")

	for historyIter.HasNext() {
		item, err := historyIter.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		buffer.WriteString(string(item.Value))
		if (historyIter.HasNext()) {
			buffer.WriteString(",")
		}
	}
	buffer.WriteString("]")
	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) GetLogQueryResult(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
  if len(args) != 4 {
    return shim.Error(fmt.Sprintf("Expecting 4 arguments; got %d", len(args)))
  }
  patientIds := strings.Split(args[0], ",")
  userIds := strings.Split(args[1], ",")

  var queryString string

  if (len(patientIds) < 1 || patientIds[0] == "") && (len(userIds) < 1 || userIds[0] == "") {
    queryString = "{}"
  } else {
    var buffer bytes.Buffer
    buffer.WriteString("{\"selector\": {\"update\":{")
    if len(patientIds) > 0 && patientIds[0] != "" {
      buffer.WriteString(s.ConstructQueryForField("patientId", patientIds))
    }
    if len(userIds) > 0 && userIds[0] != "" {
      if len(patientIds) > 0 && patientIds[0] != "" {
        buffer.WriteString(",")
      }
      buffer.WriteString(s.ConstructQueryForField("userId", userIds))
    }
    buffer.WriteString("}}}")
    queryString = buffer.String()
  }

  fmt.Println(queryString)
  resultsIterator, queryErr := APIstub.GetQueryResult(queryString)
  if queryErr != nil {
    return shim.Error(queryErr.Error())
  }

  var keys []string
  for resultsIterator.HasNext() {
    res, err := resultsIterator.Next()
    if err != nil {
      return shim.Error(err.Error())
    }

    keys = append(keys, res.Key)
  }

  var resultBuffer bytes.Buffer
  resultBuffer.WriteString("[")
  for i, key := range keys {
    if i > 0 {
      resultBuffer.WriteString(",")
    }
    historyIterator, historyErr := APIstub.GetHistoryForKey(key)
    if historyErr != nil {
      return shim.Error(historyErr.Error())
    }

    for historyIterator.HasNext() {
      item, itemErr := historyIterator.Next()
      if itemErr != nil {
        return shim.Error(itemErr.Error())
      }

      resultBuffer.WriteString("{\"value\": ")
      resultBuffer.WriteString(string(item.Value))
      resultBuffer.WriteString(", \"time\": {")
      resultBuffer.WriteString(fmt.Sprintf("\"seconds\": \"%d\",", item.Timestamp.GetSeconds()))
      resultBuffer.WriteString(fmt.Sprintf("\"nanoseconds\": \"%d\"", item.Timestamp.GetNanos()))
      resultBuffer.WriteString("}}")
      if historyIterator.HasNext() {
        resultBuffer.WriteString(",")
      }
    }
  }
  resultBuffer.WriteString("]")
  return shim.Success(resultBuffer.Bytes())
}

func (s *SmartContract) ConstructQueryForField(fieldName string, possibleValues []string) string {
  var buffer bytes.Buffer
  buffer.WriteString(fmt.Sprintf("\"%s\": {\"$in\": [", fieldName))
  for i, value := range possibleValues {
    if i > 0 {
      buffer.WriteString(",")
    }
    buffer.WriteString(fmt.Sprintf("\"%s\"",value))
  }
  buffer.WriteString("]}")
  return buffer.String()
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
