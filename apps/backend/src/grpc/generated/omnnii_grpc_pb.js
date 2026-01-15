// GENERATED CODE -- DO NOT EDIT!

var grpc = require("@grpc/grpc-js");
var omnnii_pb = require("./omnnii_pb.js");

function serialize_omnii_EnrollRequest(arg) {
	if (!(arg instanceof omnnii_pb.EnrollRequest)) {
		throw new Error("Expected argument of type omnii.EnrollRequest");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_EnrollRequest(buffer_arg) {
	return omnnii_pb.EnrollRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_EnrollResponse(arg) {
	if (!(arg instanceof omnnii_pb.EnrollResponse)) {
		throw new Error("Expected argument of type omnii.EnrollResponse");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_EnrollResponse(buffer_arg) {
	return omnnii_pb.EnrollResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_HandshakeRequest(arg) {
	if (!(arg instanceof omnnii_pb.HandshakeRequest)) {
		throw new Error("Expected argument of type omnii.HandshakeRequest");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_HandshakeRequest(buffer_arg) {
	return omnnii_pb.HandshakeRequest.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

function serialize_omnii_HandshakeResponse(arg) {
	if (!(arg instanceof omnnii_pb.HandshakeResponse)) {
		throw new Error("Expected argument of type omnii.HandshakeResponse");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_HandshakeResponse(buffer_arg) {
	return omnnii_pb.HandshakeResponse.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

function serialize_omnii_HeartbeatRequest(arg) {
	if (!(arg instanceof omnnii_pb.HeartbeatRequest)) {
		throw new Error("Expected argument of type omnii.HeartbeatRequest");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_HeartbeatRequest(buffer_arg) {
	return omnnii_pb.HeartbeatRequest.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

function serialize_omnii_HeartbeatResponse(arg) {
	if (!(arg instanceof omnnii_pb.HeartbeatResponse)) {
		throw new Error("Expected argument of type omnii.HeartbeatResponse");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_HeartbeatResponse(buffer_arg) {
	return omnnii_pb.HeartbeatResponse.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

function serialize_omnii_TriggerUpdateRequest(arg) {
	if (!(arg instanceof omnnii_pb.TriggerUpdateRequest)) {
		throw new Error("Expected argument of type omnii.TriggerUpdateRequest");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_TriggerUpdateRequest(buffer_arg) {
	return omnnii_pb.TriggerUpdateRequest.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

function serialize_omnii_TriggerUpdateResponse(arg) {
	if (!(arg instanceof omnnii_pb.TriggerUpdateResponse)) {
		throw new Error("Expected argument of type omnii.TriggerUpdateResponse");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_TriggerUpdateResponse(buffer_arg) {
	return omnnii_pb.TriggerUpdateResponse.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

function serialize_omnii_UpdateReportRequest(arg) {
	if (!(arg instanceof omnnii_pb.UpdateReportRequest)) {
		throw new Error("Expected argument of type omnii.UpdateReportRequest");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_UpdateReportRequest(buffer_arg) {
	return omnnii_pb.UpdateReportRequest.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

function serialize_omnii_UpdateReportResponse(arg) {
	if (!(arg instanceof omnnii_pb.UpdateReportResponse)) {
		throw new Error("Expected argument of type omnii.UpdateReportResponse");
	}
	return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_UpdateReportResponse(buffer_arg) {
	return omnnii_pb.UpdateReportResponse.deserializeBinary(
		new Uint8Array(buffer_arg),
	);
}

var OmniiServiceService = (exports.OmniiServiceService = {
	// Enrollment - unauthenticated, only needs valid enrollment code
	enroll: {
		path: "/omnii.OmniiService/Enroll",
		requestStream: false,
		responseStream: false,
		requestType: omnnii_pb.EnrollRequest,
		responseType: omnnii_pb.EnrollResponse,
		requestSerialize: serialize_omnii_EnrollRequest,
		requestDeserialize: deserialize_omnii_EnrollRequest,
		responseSerialize: serialize_omnii_EnrollResponse,
		responseDeserialize: deserialize_omnii_EnrollResponse,
	},
	// All methods below require token authentication
	handshake: {
		path: "/omnii.OmniiService/Handshake",
		requestStream: false,
		responseStream: false,
		requestType: omnnii_pb.HandshakeRequest,
		responseType: omnnii_pb.HandshakeResponse,
		requestSerialize: serialize_omnii_HandshakeRequest,
		requestDeserialize: deserialize_omnii_HandshakeRequest,
		responseSerialize: serialize_omnii_HandshakeResponse,
		responseDeserialize: deserialize_omnii_HandshakeResponse,
	},
	heartbeat: {
		path: "/omnii.OmniiService/Heartbeat",
		requestStream: false,
		responseStream: false,
		requestType: omnnii_pb.HeartbeatRequest,
		responseType: omnnii_pb.HeartbeatResponse,
		requestSerialize: serialize_omnii_HeartbeatRequest,
		requestDeserialize: deserialize_omnii_HeartbeatRequest,
		responseSerialize: serialize_omnii_HeartbeatResponse,
		responseDeserialize: deserialize_omnii_HeartbeatResponse,
	},
	reportUpdates: {
		path: "/omnii.OmniiService/ReportUpdates",
		requestStream: false,
		responseStream: false,
		requestType: omnnii_pb.UpdateReportRequest,
		responseType: omnnii_pb.UpdateReportResponse,
		requestSerialize: serialize_omnii_UpdateReportRequest,
		requestDeserialize: deserialize_omnii_UpdateReportRequest,
		responseSerialize: serialize_omnii_UpdateReportResponse,
		responseDeserialize: deserialize_omnii_UpdateReportResponse,
	},
	// Trigger an update on the addon (server -> addon request)
	triggerUpdate: {
		path: "/omnii.OmniiService/TriggerUpdate",
		requestStream: false,
		responseStream: false,
		requestType: omnnii_pb.TriggerUpdateRequest,
		responseType: omnnii_pb.TriggerUpdateResponse,
		requestSerialize: serialize_omnii_TriggerUpdateRequest,
		requestDeserialize: deserialize_omnii_TriggerUpdateRequest,
		responseSerialize: serialize_omnii_TriggerUpdateResponse,
		responseDeserialize: deserialize_omnii_TriggerUpdateResponse,
	},
});

exports.OmniiServiceClient = grpc.makeGenericClientConstructor(
	OmniiServiceService,
	"OmniiService",
);
