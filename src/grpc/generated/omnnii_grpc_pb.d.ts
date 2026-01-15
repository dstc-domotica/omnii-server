// package: omnii
// file: omnnii.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as omnnii_pb from "./omnnii_pb";

interface IOmniiServiceService
	extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
	enroll: IOmniiServiceService_IEnroll;
	handshake: IOmniiServiceService_IHandshake;
	heartbeat: IOmniiServiceService_IHeartbeat;
	reportUpdates: IOmniiServiceService_IReportUpdates;
	triggerUpdate: IOmniiServiceService_ITriggerUpdate;
}

interface IOmniiServiceService_IEnroll
	extends grpc.MethodDefinition<
		omnnii_pb.EnrollRequest,
		omnnii_pb.EnrollResponse
	> {
	path: "/omnii.OmniiService/Enroll";
	requestStream: false;
	responseStream: false;
	requestSerialize: grpc.serialize<omnnii_pb.EnrollRequest>;
	requestDeserialize: grpc.deserialize<omnnii_pb.EnrollRequest>;
	responseSerialize: grpc.serialize<omnnii_pb.EnrollResponse>;
	responseDeserialize: grpc.deserialize<omnnii_pb.EnrollResponse>;
}
interface IOmniiServiceService_IHandshake
	extends grpc.MethodDefinition<
		omnnii_pb.HandshakeRequest,
		omnnii_pb.HandshakeResponse
	> {
	path: "/omnii.OmniiService/Handshake";
	requestStream: false;
	responseStream: false;
	requestSerialize: grpc.serialize<omnnii_pb.HandshakeRequest>;
	requestDeserialize: grpc.deserialize<omnnii_pb.HandshakeRequest>;
	responseSerialize: grpc.serialize<omnnii_pb.HandshakeResponse>;
	responseDeserialize: grpc.deserialize<omnnii_pb.HandshakeResponse>;
}
interface IOmniiServiceService_IHeartbeat
	extends grpc.MethodDefinition<
		omnnii_pb.HeartbeatRequest,
		omnnii_pb.HeartbeatResponse
	> {
	path: "/omnii.OmniiService/Heartbeat";
	requestStream: false;
	responseStream: false;
	requestSerialize: grpc.serialize<omnnii_pb.HeartbeatRequest>;
	requestDeserialize: grpc.deserialize<omnnii_pb.HeartbeatRequest>;
	responseSerialize: grpc.serialize<omnnii_pb.HeartbeatResponse>;
	responseDeserialize: grpc.deserialize<omnnii_pb.HeartbeatResponse>;
}
interface IOmniiServiceService_IReportUpdates
	extends grpc.MethodDefinition<
		omnnii_pb.UpdateReportRequest,
		omnnii_pb.UpdateReportResponse
	> {
	path: "/omnii.OmniiService/ReportUpdates";
	requestStream: false;
	responseStream: false;
	requestSerialize: grpc.serialize<omnnii_pb.UpdateReportRequest>;
	requestDeserialize: grpc.deserialize<omnnii_pb.UpdateReportRequest>;
	responseSerialize: grpc.serialize<omnnii_pb.UpdateReportResponse>;
	responseDeserialize: grpc.deserialize<omnnii_pb.UpdateReportResponse>;
}
interface IOmniiServiceService_ITriggerUpdate
	extends grpc.MethodDefinition<
		omnnii_pb.TriggerUpdateRequest,
		omnnii_pb.TriggerUpdateResponse
	> {
	path: "/omnii.OmniiService/TriggerUpdate";
	requestStream: false;
	responseStream: false;
	requestSerialize: grpc.serialize<omnnii_pb.TriggerUpdateRequest>;
	requestDeserialize: grpc.deserialize<omnnii_pb.TriggerUpdateRequest>;
	responseSerialize: grpc.serialize<omnnii_pb.TriggerUpdateResponse>;
	responseDeserialize: grpc.deserialize<omnnii_pb.TriggerUpdateResponse>;
}

export const OmniiServiceService: IOmniiServiceService;

export interface IOmniiServiceServer extends grpc.UntypedServiceImplementation {
	enroll: grpc.handleUnaryCall<
		omnnii_pb.EnrollRequest,
		omnnii_pb.EnrollResponse
	>;
	handshake: grpc.handleUnaryCall<
		omnnii_pb.HandshakeRequest,
		omnnii_pb.HandshakeResponse
	>;
	heartbeat: grpc.handleUnaryCall<
		omnnii_pb.HeartbeatRequest,
		omnnii_pb.HeartbeatResponse
	>;
	reportUpdates: grpc.handleUnaryCall<
		omnnii_pb.UpdateReportRequest,
		omnnii_pb.UpdateReportResponse
	>;
	triggerUpdate: grpc.handleUnaryCall<
		omnnii_pb.TriggerUpdateRequest,
		omnnii_pb.TriggerUpdateResponse
	>;
}

export interface IOmniiServiceClient {
	enroll(
		request: omnnii_pb.EnrollRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.EnrollResponse,
		) => void,
	): grpc.ClientUnaryCall;
	enroll(
		request: omnnii_pb.EnrollRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.EnrollResponse,
		) => void,
	): grpc.ClientUnaryCall;
	enroll(
		request: omnnii_pb.EnrollRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.EnrollResponse,
		) => void,
	): grpc.ClientUnaryCall;
	handshake(
		request: omnnii_pb.HandshakeRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HandshakeResponse,
		) => void,
	): grpc.ClientUnaryCall;
	handshake(
		request: omnnii_pb.HandshakeRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HandshakeResponse,
		) => void,
	): grpc.ClientUnaryCall;
	handshake(
		request: omnnii_pb.HandshakeRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HandshakeResponse,
		) => void,
	): grpc.ClientUnaryCall;
	heartbeat(
		request: omnnii_pb.HeartbeatRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HeartbeatResponse,
		) => void,
	): grpc.ClientUnaryCall;
	heartbeat(
		request: omnnii_pb.HeartbeatRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HeartbeatResponse,
		) => void,
	): grpc.ClientUnaryCall;
	heartbeat(
		request: omnnii_pb.HeartbeatRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HeartbeatResponse,
		) => void,
	): grpc.ClientUnaryCall;
	reportUpdates(
		request: omnnii_pb.UpdateReportRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.UpdateReportResponse,
		) => void,
	): grpc.ClientUnaryCall;
	reportUpdates(
		request: omnnii_pb.UpdateReportRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.UpdateReportResponse,
		) => void,
	): grpc.ClientUnaryCall;
	reportUpdates(
		request: omnnii_pb.UpdateReportRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.UpdateReportResponse,
		) => void,
	): grpc.ClientUnaryCall;
	triggerUpdate(
		request: omnnii_pb.TriggerUpdateRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.TriggerUpdateResponse,
		) => void,
	): grpc.ClientUnaryCall;
	triggerUpdate(
		request: omnnii_pb.TriggerUpdateRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.TriggerUpdateResponse,
		) => void,
	): grpc.ClientUnaryCall;
	triggerUpdate(
		request: omnnii_pb.TriggerUpdateRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.TriggerUpdateResponse,
		) => void,
	): grpc.ClientUnaryCall;
}

export class OmniiServiceClient
	extends grpc.Client
	implements IOmniiServiceClient
{
	constructor(
		address: string,
		credentials: grpc.ChannelCredentials,
		options?: Partial<grpc.ClientOptions>,
	);
	public enroll(
		request: omnnii_pb.EnrollRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.EnrollResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public enroll(
		request: omnnii_pb.EnrollRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.EnrollResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public enroll(
		request: omnnii_pb.EnrollRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.EnrollResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public handshake(
		request: omnnii_pb.HandshakeRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HandshakeResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public handshake(
		request: omnnii_pb.HandshakeRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HandshakeResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public handshake(
		request: omnnii_pb.HandshakeRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HandshakeResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public heartbeat(
		request: omnnii_pb.HeartbeatRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HeartbeatResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public heartbeat(
		request: omnnii_pb.HeartbeatRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HeartbeatResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public heartbeat(
		request: omnnii_pb.HeartbeatRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.HeartbeatResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public reportUpdates(
		request: omnnii_pb.UpdateReportRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.UpdateReportResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public reportUpdates(
		request: omnnii_pb.UpdateReportRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.UpdateReportResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public reportUpdates(
		request: omnnii_pb.UpdateReportRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.UpdateReportResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public triggerUpdate(
		request: omnnii_pb.TriggerUpdateRequest,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.TriggerUpdateResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public triggerUpdate(
		request: omnnii_pb.TriggerUpdateRequest,
		metadata: grpc.Metadata,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.TriggerUpdateResponse,
		) => void,
	): grpc.ClientUnaryCall;
	public triggerUpdate(
		request: omnnii_pb.TriggerUpdateRequest,
		metadata: grpc.Metadata,
		options: Partial<grpc.CallOptions>,
		callback: (
			error: grpc.ServiceError | null,
			response: omnnii_pb.TriggerUpdateResponse,
		) => void,
	): grpc.ClientUnaryCall;
}
