package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
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
	Time              int64  `json:"time"`
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
	Time              int64  `json:"time"`
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
	Time              int64  `json:"time"`
}

type Event struct {
	ActionType        string `json:"actionType"`
	PatientID         string `json:"patientId"`
	RecordID          string `json:"recordId"`
	UserID            string `json:"userId"`
	DataType          string `json:"dataType"`
	OriginalAuthorID  string `json:"originalAuthorId"`
	DataField         string `json:"dataField"`
	Data              string `json:"data"`
	EntryMethod       string `json:"entryMethod"`
	UserNPI           string `json:"userNpi"`
	OriginalAuthorNPI string `json:"originalAuthorNpi"`
	OrganizationNPI   string `json:"organizationNpi"`
	Time              int64  `json:"time"`
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
	} else if fn == "getAllLogsForQueryForTimeRange" {
		return s.GetAllLogsForQueryForTimeRange(APIstub, args)
	}

	return shim.Error(fmt.Sprintf("Unrecognized function %s", fn))
}

func (s *SmartContract) RecordUpdate(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 13 {
		return shim.Error(fmt.Sprintf("Expecting 13 arguments; got %d", len(args)))
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

func (s *SmartContract) GetByteArrayFromEvents(events []Event) ([]byte, error) {
	var buffer bytes.Buffer
	buffer.WriteString("[")
	for i, event := range events {
		marshaledEvent, marshalErr := json.Marshal(event)
		if marshalErr != nil {
			return []byte{}, marshalErr
		}
		if i > 0 {
			buffer.WriteString(",")
		}
		buffer.WriteString(fmt.Sprintf("{%s}", marshaledEvent))
	}
	buffer.WriteString("]")
	return buffer.Bytes(), nil
}

func (s *SmartContract) GetStringMapFromArgs(args []string) (map[string]string, error) {
	details := map[string]string{}
	for i := 0; i < len(args); i++ {
		pieces := strings.Split(args[i], ":")
		if len(pieces) != 2 {
			return details, fmt.Errorf("Incorrectly formatted argument %s", args[i])
		}
		if s.IsValidField(pieces[0]) {
			details[pieces[0]] = pieces[1]
		} else {
			return details, fmt.Errorf("invalid field %s", pieces[0])
		}
	}
	return details, nil
}

func (s *SmartContract) CreateRecordEvent(args []string) (RecordEvent, error) {
	stringMap, mapErr := s.GetStringMapFromArgs(args)
	if mapErr != nil {
		return RecordEvent{}, mapErr
	}
	time, timeConvErr := strconv.ParseInt(stringMap["time"], 10, 64)
	if timeConvErr != nil {
		return RecordEvent{}, timeConvErr
	}
	recordEvent := RecordEvent{
		ActionType:        stringMap["actionType"],
		PatientID:         stringMap["patientId"],
		UserID:            stringMap["userId"],
		DataType:          stringMap["dataType"],
		OriginalAuthorID:  stringMap["originalAuthorId"],
		DataField:         stringMap["dataField"],
		Data:              stringMap["data"],
		EntryMethod:       stringMap["entryMethod"],
		UserNPI:           stringMap["userNpi"],
		OriginalAuthorNPI: stringMap["originalAuthorNpi"],
		OrganizationNPI:   stringMap["organizationNpi"],
		Time:              time,
	}
	return recordEvent, nil
}

func (s *SmartContract) CreatePatientEvent(args []string) (PatientEvent, error) {
	stringMap, mapErr := s.GetStringMapFromArgs(args)
	if mapErr != nil {
		return PatientEvent{}, mapErr
	}
	time, timeConvErr := strconv.ParseInt(stringMap["time"], 10, 64)
	if timeConvErr != nil {
		return PatientEvent{}, timeConvErr
	}
	patientEvent := PatientEvent{
		ActionType:        stringMap["actionType"],
		RecordID:          stringMap["recordId"],
		UserID:            stringMap["userId"],
		DataType:          stringMap["dataType"],
		OriginalAuthorID:  stringMap["originalAuthorId"],
		DataField:         stringMap["dataField"],
		Data:              stringMap["data"],
		EntryMethod:       stringMap["entryMethod"],
		UserNPI:           stringMap["userNpi"],
		OriginalAuthorNPI: stringMap["originalAuthorNpi"],
		OrganizationNPI:   stringMap["organizationNpi"],
		Time:              time,
	}
	return patientEvent, nil
}

func (s *SmartContract) CreateUserEvent(args []string) (UserEvent, error) {
	stringMap, mapErr := s.GetStringMapFromArgs(args)
	if mapErr != nil {
		return UserEvent{}, mapErr
	}
	time, timeConvErr := strconv.ParseInt(stringMap["time"], 10, 64)
	if timeConvErr != nil {
		return UserEvent{}, timeConvErr
	}
	userEvent := UserEvent{
		ActionType:        stringMap["actionType"],
		PatientID:         stringMap["patientId"],
		RecordID:          stringMap["recordId"],
		DataType:          stringMap["dataType"],
		OriginalAuthorID:  stringMap["originalAuthorId"],
		DataField:         stringMap["dataField"],
		Data:              stringMap["data"],
		EntryMethod:       stringMap["entryMethod"],
		UserNPI:           stringMap["userNpi"],
		OriginalAuthorNPI: stringMap["originalAuthorNpi"],
		OrganizationNPI:   stringMap["organizationNpi"],
		Time:              time,
	}
	return userEvent, nil
}

func (s *SmartContract) IsValidField(field string) bool {
	switch field {
	case
		"actionType", "userId", "patientId", "recordId", "dataType", "originalAuthorId",
		"dataField", "data", "entryMethod", "userNpi", "originalAuthorNpi",
		"organizationNpi", "time":
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

func (s *SmartContract) GetHistoryForKeys(APIstub shim.ChaincodeStubInterface, keys []string, start int64, end int64) sc.Response {
	var events []Event
	for _, key := range keys {
		historyIterator, historyErr := APIstub.GetHistoryForKey(key)
		if historyErr != nil {
			return shim.Error(historyErr.Error())
		}

		for historyIterator.HasNext() {
			item, itemErr := historyIterator.Next()
			if itemErr != nil {
				return shim.Error(itemErr.Error())
			}
			event := Event{}
			unmarshalErr := json.Unmarshal(item.Value, &event)
			if unmarshalErr != nil {
				return shim.Error(unmarshalErr.Error())
			}
			if (start >= 0 && event.Time < start) || (end >= 0 && event.Time > end) {
				continue
			}
			missingField := strings.Split(key, ":")[0]
			missingValue := strings.Split(key, ":")[1]
			switch missingField {
			case "recordId":
				event.RecordID = missingValue
				break
			case "userId":
				event.UserID = missingValue
				break
			case "patientId":
				event.PatientID = missingValue
				break
			default:
				break
			}
			events = append(events, event)
		}
	}
	eventsAsBytes, marshalErr := json.Marshal(events)
	if marshalErr != nil {
		return shim.Error(marshalErr.Error())
	}
	return shim.Success(eventsAsBytes)
}

/**
	* GetAllLogsForQueryForTimeRange()
	* args[0]: start time
	* args[1]: end time
	* args[2]: comma-separated recordIds; empty string means no filtering on this
	* field
	* args[3]: comma-separated userIds; empty string means no filtering on this
	* field
	* args[4]: comma-separated patientIds; empty string means no filtering on this
	* field
	* OR all ids in same array; AND result; filter by time
**/
func (s *SmartContract) GetAllLogsForQueryForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 5 {
		return shim.Error(fmt.Sprintf("Expecting 2 arguments; got %d", len(args)))
	}

	start, startParseErr := strconv.ParseInt(args[0], 10, 64)
	if startParseErr != nil {
		start = -1 // no start time specified
	}
	end, endParseErr := strconv.ParseInt(args[1], 10, 64)
	if endParseErr != nil {
		end = -1 // no end time specified
	}

	unformattedRecordIds := strings.Split(args[2], ",")
	recordIds := []string{}
	for _, id := range unformattedRecordIds {
		if id != "" {
			recordIds = append(recordIds, fmt.Sprintf("recordId:%s", id))
		}
	}
	unformattedUserIds := strings.Split(args[3], ",")
	userIds := []string{}
	for _, id := range unformattedUserIds {
		if id != "" {
			userIds = append(userIds, fmt.Sprintf("userId:%s", id))
		}
	}
	unformattedPatientIds := strings.Split(args[4], ",")
	patientIds := []string{}
	for _, id := range unformattedPatientIds {
		if id != "" {
			patientIds = append(patientIds, fmt.Sprintf("patientId:%s", id))
		}
	}

	useRecordIds := len(recordIds) > 0 && recordIds[0] != ""
	useUserIds := len(userIds) > 0 && userIds[0] != ""
	usePatientIds := len(patientIds) > 0 && patientIds[0] != ""

	var keys []string
	var flag int

	if useRecordIds {
		keys = recordIds
		flag = 0
	} else if useUserIds {
		keys = userIds
		flag = 1
	} else if usePatientIds {
		keys = patientIds
		flag = 2
	} else {
		return s.GetAllLogsForTimeRange(APIstub, args[:2])
	}

	var events []Event
	for _, key := range keys {
		historyIterator, historyErr := APIstub.GetHistoryForKey(key)
		if historyErr != nil {
			return shim.Error(historyErr.Error())
		}
		for historyIterator.HasNext() {
			item, itemErr := historyIterator.Next()
			if itemErr != nil {
				return shim.Error(itemErr.Error())
			}

			event := Event{}
			unmarshalErr := json.Unmarshal(item.Value, &event)
			if unmarshalErr != nil {
				return shim.Error(fmt.Sprintf("Error unmarshaling: %+v", unmarshalErr))
			}
			if (start >= 0 && event.Time < start) || (end >= 0 && event.Time > end) {
				continue
			}
			missingField := strings.Split(key, ":")[1]

			if flag == 0 {
				if useUserIds && !contains(unformattedUserIds, event.UserID) {
					continue
				}
				if usePatientIds && !contains(unformattedPatientIds, event.PatientID) {
					continue
				}
				event.RecordID = missingField
				events = append(events, event)
			}
			if flag == 1 {
				if usePatientIds && !contains(unformattedPatientIds, event.PatientID) {
					continue
				}
				event.UserID = missingField
				events = append(events, event)
			}
			if flag == 2 {
				event.PatientID = missingField
				events = append(events, event)
			}
		}
	}
	eventsAsBytes, toBytesErr := json.Marshal(events)
	if toBytesErr != nil {
		return shim.Error(fmt.Sprintf("Error getting byte array: %+v", toBytesErr))
	}
	return shim.Success(eventsAsBytes)
}

func contains(arr []string, s string) bool {
	for _, val := range arr {
		if val == s {
			return true
		}
	}
	return false
}

func (s *SmartContract) GetAllLogsForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error(fmt.Sprintf("Expecting 2 arguments; got %d", len(args)))
	}

	start, startParseErr := strconv.ParseInt(args[0], 10, 64)
	if startParseErr != nil {
		start = -1
	}
	end, endParseErr := strconv.ParseInt(args[1], 10, 64)
	if endParseErr != nil {
		end = -1
	}

	// get logs indexed on recordId (arbitrary)
	queryString := "{\"selector\":{\"_id\":{\"$regex\":\"recordId:*\"}}}"
	iterator, queryErr := APIstub.GetQueryResult(queryString)
	if queryErr != nil {
		return shim.Error("There was a problem executing the query")
	}

	keys := s.GetIds(iterator)
	var events []Event
	for _, key := range keys {
		historyIterator, iteratorErr := APIstub.GetHistoryForKey(key)
		if iteratorErr != nil {
			return shim.Error(fmt.Sprintf("Error getting history for key: %+v", iteratorErr))
		}
		for historyIterator.HasNext() {
			item, itemErr := historyIterator.Next()
			if itemErr != nil {
				return shim.Error(itemErr.Error())
			}
			event := Event{}
			unmarshalErr := json.Unmarshal(item.Value, &event)
			if unmarshalErr != nil {
				return shim.Error(unmarshalErr.Error())
			}
			if (start >= 0 && event.Time < start) || (end >= 0 && event.Time > end) {
				continue
			}
			event.RecordID = strings.Split(key, ":")[1]
			events = append(events, event)
		}
	}
	marshaled, marshalErr := json.Marshal(events)
	if marshalErr != nil {
		return shim.Error(marshalErr.Error())
	}
	return shim.Success(marshaled)
}

func (s *SmartContract) GetAllLogsForUserForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Expecting 3 arguments; got %d", len(args)))
	}

	start, startParseErr := strconv.ParseInt(args[0], 10, 64)
	if startParseErr != nil {
		start = -1
	}
	end, endParseErr := strconv.ParseInt(args[1], 10, 64)
	if endParseErr != nil {
		end = -1
	}

	return s.GetHistoryForKeys(APIstub, []string{fmt.Sprintf("userId:%s", args[2])}, start, end)
}

func (s *SmartContract) GetAllLogsForPatientForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Expecting 3 arguments; got %d", len(args)))
	}

	start, startParseErr := strconv.ParseInt(args[0], 10, 64)
	if startParseErr != nil {
		start = -1
	}
	end, endParseErr := strconv.ParseInt(args[1], 10, 64)
	if endParseErr != nil {
		end = -1
	}

	return s.GetHistoryForKeys(APIstub, []string{fmt.Sprintf("patientId:%s", args[2])}, start, end)
}

func (s *SmartContract) GetAllLogsForRecordForTimeRange(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(fmt.Sprintf("Expecting 3 arguments; got %d", len(args)))
	}

	start, startParseErr := strconv.ParseInt(args[0], 10, 64)
	if startParseErr != nil {
		start = -1
	}
	end, endParseErr := strconv.ParseInt(args[1], 10, 64)
	if endParseErr != nil {
		end = -1
	}

	return s.GetHistoryForKeys(APIstub, []string{fmt.Sprintf("recordId:%s", args[2])}, start, end)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
