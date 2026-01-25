// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var omnnii_pb = require('./omnnii_pb.js');

function serialize_omnii_ConnectivityReportRequest(arg) {
  if (!(arg instanceof omnnii_pb.ConnectivityReportRequest)) {
    throw new Error('Expected argument of type omnii.ConnectivityReportRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_ConnectivityReportRequest(buffer_arg) {
  return omnnii_pb.ConnectivityReportRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_ConnectivityReportResponse(arg) {
  if (!(arg instanceof omnnii_pb.ConnectivityReportResponse)) {
    throw new Error('Expected argument of type omnii.ConnectivityReportResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_ConnectivityReportResponse(buffer_arg) {
  return omnnii_pb.ConnectivityReportResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_EnrollRequest(arg) {
  if (!(arg instanceof omnnii_pb.EnrollRequest)) {
    throw new Error('Expected argument of type omnii.EnrollRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_EnrollRequest(buffer_arg) {
  return omnnii_pb.EnrollRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_EnrollResponse(arg) {
  if (!(arg instanceof omnnii_pb.EnrollResponse)) {
    throw new Error('Expected argument of type omnii.EnrollResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_EnrollResponse(buffer_arg) {
  return omnnii_pb.EnrollResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_HeartbeatRequest(arg) {
  if (!(arg instanceof omnnii_pb.HeartbeatRequest)) {
    throw new Error('Expected argument of type omnii.HeartbeatRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_HeartbeatRequest(buffer_arg) {
  return omnnii_pb.HeartbeatRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_HeartbeatResponse(arg) {
  if (!(arg instanceof omnnii_pb.HeartbeatResponse)) {
    throw new Error('Expected argument of type omnii.HeartbeatResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_HeartbeatResponse(buffer_arg) {
  return omnnii_pb.HeartbeatResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_RefreshTokenRequest(arg) {
  if (!(arg instanceof omnnii_pb.RefreshTokenRequest)) {
    throw new Error('Expected argument of type omnii.RefreshTokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_RefreshTokenRequest(buffer_arg) {
  return omnnii_pb.RefreshTokenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_RefreshTokenResponse(arg) {
  if (!(arg instanceof omnnii_pb.RefreshTokenResponse)) {
    throw new Error('Expected argument of type omnii.RefreshTokenResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_RefreshTokenResponse(buffer_arg) {
  return omnnii_pb.RefreshTokenResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_StatsReportRequest(arg) {
  if (!(arg instanceof omnnii_pb.StatsReportRequest)) {
    throw new Error('Expected argument of type omnii.StatsReportRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_StatsReportRequest(buffer_arg) {
  return omnnii_pb.StatsReportRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_StatsReportResponse(arg) {
  if (!(arg instanceof omnnii_pb.StatsReportResponse)) {
    throw new Error('Expected argument of type omnii.StatsReportResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_StatsReportResponse(buffer_arg) {
  return omnnii_pb.StatsReportResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_TriggerUpdateRequest(arg) {
  if (!(arg instanceof omnnii_pb.TriggerUpdateRequest)) {
    throw new Error('Expected argument of type omnii.TriggerUpdateRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_TriggerUpdateRequest(buffer_arg) {
  return omnnii_pb.TriggerUpdateRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_TriggerUpdateResponse(arg) {
  if (!(arg instanceof omnnii_pb.TriggerUpdateResponse)) {
    throw new Error('Expected argument of type omnii.TriggerUpdateResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_TriggerUpdateResponse(buffer_arg) {
  return omnnii_pb.TriggerUpdateResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_UpdateReportRequest(arg) {
  if (!(arg instanceof omnnii_pb.UpdateReportRequest)) {
    throw new Error('Expected argument of type omnii.UpdateReportRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_UpdateReportRequest(buffer_arg) {
  return omnnii_pb.UpdateReportRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_omnii_UpdateReportResponse(arg) {
  if (!(arg instanceof omnnii_pb.UpdateReportResponse)) {
    throw new Error('Expected argument of type omnii.UpdateReportResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_omnii_UpdateReportResponse(buffer_arg) {
  return omnnii_pb.UpdateReportResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var OmniiServiceService = exports.OmniiServiceService = {
  // Enrollment - unauthenticated, only needs valid enrollment code
enroll: {
    path: '/omnii.OmniiService/Enroll',
    requestStream: false,
    responseStream: false,
    requestType: omnnii_pb.EnrollRequest,
    responseType: omnnii_pb.EnrollResponse,
    requestSerialize: serialize_omnii_EnrollRequest,
    requestDeserialize: deserialize_omnii_EnrollRequest,
    responseSerialize: serialize_omnii_EnrollResponse,
    responseDeserialize: deserialize_omnii_EnrollResponse,
  },
  // Refresh short-lived access tokens
refreshToken: {
    path: '/omnii.OmniiService/RefreshToken',
    requestStream: false,
    responseStream: false,
    requestType: omnnii_pb.RefreshTokenRequest,
    responseType: omnnii_pb.RefreshTokenResponse,
    requestSerialize: serialize_omnii_RefreshTokenRequest,
    requestDeserialize: deserialize_omnii_RefreshTokenRequest,
    responseSerialize: serialize_omnii_RefreshTokenResponse,
    responseDeserialize: deserialize_omnii_RefreshTokenResponse,
  },
  // All methods below require token authentication via metadata
heartbeat: {
    path: '/omnii.OmniiService/Heartbeat',
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
    path: '/omnii.OmniiService/ReportUpdates',
    requestStream: false,
    responseStream: false,
    requestType: omnnii_pb.UpdateReportRequest,
    responseType: omnnii_pb.UpdateReportResponse,
    requestSerialize: serialize_omnii_UpdateReportRequest,
    requestDeserialize: deserialize_omnii_UpdateReportRequest,
    responseSerialize: serialize_omnii_UpdateReportResponse,
    responseDeserialize: deserialize_omnii_UpdateReportResponse,
  },
  reportStats: {
    path: '/omnii.OmniiService/ReportStats',
    requestStream: false,
    responseStream: false,
    requestType: omnnii_pb.StatsReportRequest,
    responseType: omnnii_pb.StatsReportResponse,
    requestSerialize: serialize_omnii_StatsReportRequest,
    requestDeserialize: deserialize_omnii_StatsReportRequest,
    responseSerialize: serialize_omnii_StatsReportResponse,
    responseDeserialize: deserialize_omnii_StatsReportResponse,
  },
  reportConnectivity: {
    path: '/omnii.OmniiService/ReportConnectivity',
    requestStream: false,
    responseStream: false,
    requestType: omnnii_pb.ConnectivityReportRequest,
    responseType: omnnii_pb.ConnectivityReportResponse,
    requestSerialize: serialize_omnii_ConnectivityReportRequest,
    requestDeserialize: deserialize_omnii_ConnectivityReportRequest,
    responseSerialize: serialize_omnii_ConnectivityReportResponse,
    responseDeserialize: deserialize_omnii_ConnectivityReportResponse,
  },
  // Trigger an update on the addon (server -> addon request)
triggerUpdate: {
    path: '/omnii.OmniiService/TriggerUpdate',
    requestStream: false,
    responseStream: false,
    requestType: omnnii_pb.TriggerUpdateRequest,
    responseType: omnnii_pb.TriggerUpdateResponse,
    requestSerialize: serialize_omnii_TriggerUpdateRequest,
    requestDeserialize: deserialize_omnii_TriggerUpdateRequest,
    responseSerialize: serialize_omnii_TriggerUpdateResponse,
    responseDeserialize: deserialize_omnii_TriggerUpdateResponse,
  },
};

exports.OmniiServiceClient = grpc.makeGenericClientConstructor(OmniiServiceService, 'OmniiService');
