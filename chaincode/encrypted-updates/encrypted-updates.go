package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

/** RecordEvent
  * information keyed by record ID
  *
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
type RecordEvent struct {
	ActionType        string `json:"actionType"`
	UserID            string `json:"userId"`
	PatientID         string `json:"patientId"`
	DataType          string `json:"dataType"`
	OriginalAuthorID  string `json:"originalAuthorId"`
	DataField         string `json:"dataField"`
	Data              string `json:"data"`
	EntryMethod       string `json:"entryMethod"`
	UserNPI           string `json:"userNpi"`
	OriginalAuthorNPI string `json:"originalAuthorNpi"`
	OrganizationNPI   string `json:"organizationNpi"`
}

/** PatientEvent
  * information keyed by patient ID
**/
type PatientEvent struct {
	ActionType        string `json:"actionType"`
	UserID            string `json:"userId"`
	RecordID          string `json:"recordId"`
	DataType          string `json:"dataType"`
	OriginalAuthorID  string `json:"originalAuthorId"`
	DataField         string `json:"dataField"`
	Data              string `json:"data"`
	EntryMethod       string `json:"entryMethod"`
	UserNPI           string `json:"userNpi"`
	OriginalAuthorNPI string `json:"originalAuthorNpi"`
	OrganizationNPI   string `json:"organizationNpi"`
}

/** UserEvent
  * information keyed by user ID
**/
type UserEvent struct {
	ActionType        string `json:"actionType"`
	PatientID         string `json:"patientId"`
	RecordID          string `json:"recordId"`
	DataType          string `json:"dataType"`
	OriginalAuthorID  string `json:"originalAuthorId"`
	DataField         string `json:"dataField"`
	Data              string `json:"data"`
	EntryMethod       string `json:"entryMethod"`
	UserNPI           string `json:"userNpi"`
	OriginalAuthorNPI string `json:"originalAuthorNpi"`
	OrganizationNPI   string `json:"organizationNpi"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	fn, args := APIstub.GetFunctionAndParameters()

	if fn == "recordUpdate" {
		return s.RecordUpdate(APIstub, args)
	} else if fn == "getAllLogsForTimeRange" {
		return s.GetAllLogsForTimeRange(APIstub, args)
	} else if fn == "getAllLogsForUserForTimeRange" {
		return s.GetAllLogsForUserForTimeRange(APIstub, args)
	} else if fn == "getAllLogsForPatientForTimeRange" {
		return s.GetAllLogsForPatientForTimeRange(APIstub, args)
	} else if fn == "getAllLogsForRecordForTimeRange" {
		return s.GetAllLogsForRecordForTimeRange(APIstub, args)
	}

	return shim.Error(fmt.Sprintf("Unrecognized function %s", fn))
}

func (s *SmartContract) RecordUpdate(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 12 {
		return shim.Error(fmt.Sprintf("Expecting 12 arguments; got %d", len(args)))
	}

	recordArgs := make([]string, len(args)-1)
	copy(recordArgs, args[1:])
	patientArgs := make([]string, len(args)-1)
	copy(patientArgs[:1], args[:1])
	copy(patientArgs[1:], args[2:])
	userArgs := make([]string, len(args)-1)
	copy(userArgs[:2], args[:2])
	copy(userArgs[2:], args[3:])
	fmt.Println(recordArgs)
	fmt.Println(patientArgs)
	fmt.Println(userArgs)

	recordEvent, recordErr := s.CreateRecordEvent(recordArgs)
	if recordErr != nil {
		return shim.Error(fmt.Sprintf("%+v", recordErr))
	}
	recordEventAsBytes, recordBytesErr := json.Marshal(recordEvent)
	if recordBytesErr != nil {
		return shim.Error(fmt.Sprintf("Error marshaling RecordEvent: %+v", recordBytesErr))
	}

	patientEvent, patientErr := s.CreatePatientEvent(patientArgs)
	if patientErr != nil {
		return shim.Error(fmt.Sprintf("%+v", patientErr))
	}
	patientEventAsBytes, patientBytesErr := json.Marshal(patientEvent)
	if patientBytesErr != nil {
		return shim.Error(fmt.Sprintf("Error marshaling PatientEvent: %+v", patientBytesErr))
	}

	userEvent, userErr := s.CreateUserEvent(userArgs)
	if userErr != nil {
		return shim.Error(fmt.Sprintf("%+v", userErr))
	}
	userEventAsBytes, userBytesErr := json.Marshal(userEvent)
	if userBytesErr != nil {
		return shim.Error(fmt.Sprintf("Error marshaling UserEvent: %+v", userBytesErr))
	}

	APIstub.PutState(args[0], recordEventAsBytes)
	APIstub.PutState(args[1], patientEventAsBytes)
	APIstub.PutState(args[2], userEventAsBytes)

	return shim.Success([]byte("successfully updated ledger"))
}

func (s *SmartContract) GetByteArrayFromArgs(args []string) ([]byte, error) {
	details := map[string]string{}
	for i := 0; i < len(args); i++ {
		pieces := strings.Split(args[i], ":")
		if len(pieces) != 2 {
			return []byte{}, fmt.Errorf("Incorrectly formatted argument %s", args[i])
		}
		if s.IsValidField(pieces[0]) {
			details[pieces[0]] = pieces[1]
		} else {
			return []byte{}, fmt.Errorf("invalid field %s", pieces[0])
		}
	}

	marshaled, marshalErr := json.Marshal(details)
	if marshalErr != nil {
		return []byte{}, fmt.Errorf("Error marshalling map: %+v", marshalErr)
	}
	return marshaled, nil
}

func (s *SmartContract) CreateRecordEvent(args []string) (RecordEvent, error) {
	marshaled, marshalErr := s.GetByteArrayFromArgs(args)
	if marshalErr != nil {
		return RecordEvent{}, marshalErr
	}
	recordEvent := RecordEvent{}
	unmarshalErr := json.Unmarshal(marshaled, &recordEvent)
	if unmarshalErr != nil {
		return recordEvent, fmt.Errorf("Error unmarshaling into RecordEvent: %+v", unmarshalErr)
	}
	return recordEvent, nil
}

func (s *SmartContract) CreatePatientEvent(args []string) (PatientEvent, error) {
	marshaled, marshalErr := s.GetByteArrayFromArgs(args)
	if marshalErr != nil {
		return PatientEvent{}, marshalErr
	}
	patientEvent := PatientEvent{}
	unmarshalErr := json.Unmarshal(marshaled, &patientEvent)
	if unmarshalErr != nil {
		return patientEvent, fmt.Errorf("Error unmarshaling into PatientEvent: %+v", unmarshalErr)
	}
	return patientEvent, nil
}

func (s *SmartContract) CreateUserEvent(args []string) (UserEvent, error) {
	marshaled, marshalErr := s.GetByteArrayFromArgs(args)
	if marshalErr != nil {
		return UserEvent{}, marshalErr
	}
	userEvent := UserEvent{}
	unmarshalErr := json.Unmarshal(marshaled, &userEvent)
	if unmarshalErr != nil {
		return userEvent, fmt.Errorf("Error unmarshaling into UserEvent: %+v", unmarshalErr)
	}
	return userEvent, nil
}

func (s *SmartContract) IsValidField(field string) bool {
	switch field {
	case
		"actionType", "userId", "patientId", "recordId", "dataType", "originalAuthorId",
		"dataField", "data", "entryMethod", "userNpi", "originalAuthorNpi",
		"organizationNpi":
		return true
	}
	return false
}

func (s *SmartContract) GetIds(iter shim.StateQueryIteratorInterface) []string {
	var ids []string
	for iter.HasNext() {
		res, err := iter.Next()
		if err == nil {
			ids = append(ids, res.Key)
		}
	}
	return ids
}

func (s *SmartContract) GetHistoryForKeys(APIstub shim.ChaincodeStubInterface, keys []string) sc.Response {
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

func (s *SmartContract) GetAllLogsForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error(fmt.Sprintf("Expecting 2 arguments; got %d", len(args)))
	}

	// get logs indexed on recordId (arbitrary)
	queryString := "{\"selector\":{\"_id\":{\"$regex\":\"recordId:*\"}}}"
	iterator, queryErr := APIstub.GetQueryResult(queryString)
	if queryErr != nil {
		return shim.Error("There was a problem executing the query")
	}

	keys := s.GetIds(iterator)
	return s.GetHistoryForKeys(APIstub, keys)

}

func (s *SmartContract) GetAllLogsForUserForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Expecting 3 arguments; got %d", len(args)))
	}

	return s.GetHistoryForKeys(APIstub, []string{fmt.Sprintf("userId:%s", args[2])})
}

func (s *SmartContract) GetAllLogsForPatientForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Expecting 3 arguments; got %d", len(args)))
	}

	return s.GetHistoryForKeys(APIstub, []string{fmt.Sprintf("patientId:%s", args[2])})
}

func (s *SmartContract) GetAllLogsForRecordForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Expecting 3 arguments; got %d", len(args)))
	}

	return s.GetHistoryForKeys(APIstub, []string{fmt.Sprintf("recordId:%s", args[2])})
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
