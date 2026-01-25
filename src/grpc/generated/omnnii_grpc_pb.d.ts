// package: omnii
// file: omnnii.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as omnnii_pb from "./omnnii_pb";

interface IOmniiServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    enroll: IOmniiServiceService_IEnroll;
    refreshToken: IOmniiServiceService_IRefreshToken;
    heartbeat: IOmniiServiceService_IHeartbeat;
    reportUpdates: IOmniiServiceService_IReportUpdates;
    reportStats: IOmniiServiceService_IReportStats;
    reportConnectivity: IOmniiServiceService_IReportConnectivity;
    triggerUpdate: IOmniiServiceService_ITriggerUpdate;
}

interface IOmniiServiceService_IEnroll extends grpc.MethodDefinition<omnnii_pb.EnrollRequest, omnnii_pb.EnrollResponse> {
    path: "/omnii.OmniiService/Enroll";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<omnnii_pb.EnrollRequest>;
    requestDeserialize: grpc.deserialize<omnnii_pb.EnrollRequest>;
    responseSerialize: grpc.serialize<omnnii_pb.EnrollResponse>;
    responseDeserialize: grpc.deserialize<omnnii_pb.EnrollResponse>;
}
interface IOmniiServiceService_IRefreshToken extends grpc.MethodDefinition<omnnii_pb.RefreshTokenRequest, omnnii_pb.RefreshTokenResponse> {
    path: "/omnii.OmniiService/RefreshToken";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<omnnii_pb.RefreshTokenRequest>;
    requestDeserialize: grpc.deserialize<omnnii_pb.RefreshTokenRequest>;
    responseSerialize: grpc.serialize<omnnii_pb.RefreshTokenResponse>;
    responseDeserialize: grpc.deserialize<omnnii_pb.RefreshTokenResponse>;
}
interface IOmniiServiceService_IHeartbeat extends grpc.MethodDefinition<omnnii_pb.HeartbeatRequest, omnnii_pb.HeartbeatResponse> {
    path: "/omnii.OmniiService/Heartbeat";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<omnnii_pb.HeartbeatRequest>;
    requestDeserialize: grpc.deserialize<omnnii_pb.HeartbeatRequest>;
    responseSerialize: grpc.serialize<omnnii_pb.HeartbeatResponse>;
    responseDeserialize: grpc.deserialize<omnnii_pb.HeartbeatResponse>;
}
interface IOmniiServiceService_IReportUpdates extends grpc.MethodDefinition<omnnii_pb.UpdateReportRequest, omnnii_pb.UpdateReportResponse> {
    path: "/omnii.OmniiService/ReportUpdates";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<omnnii_pb.UpdateReportRequest>;
    requestDeserialize: grpc.deserialize<omnnii_pb.UpdateReportRequest>;
    responseSerialize: grpc.serialize<omnnii_pb.UpdateReportResponse>;
    responseDeserialize: grpc.deserialize<omnnii_pb.UpdateReportResponse>;
}
interface IOmniiServiceService_IReportStats extends grpc.MethodDefinition<omnnii_pb.StatsReportRequest, omnnii_pb.StatsReportResponse> {
    path: "/omnii.OmniiService/ReportStats";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<omnnii_pb.StatsReportRequest>;
    requestDeserialize: grpc.deserialize<omnnii_pb.StatsReportRequest>;
    responseSerialize: grpc.serialize<omnnii_pb.StatsReportResponse>;
    responseDeserialize: grpc.deserialize<omnnii_pb.StatsReportResponse>;
}
interface IOmniiServiceService_IReportConnectivity extends grpc.MethodDefinition<omnnii_pb.ConnectivityReportRequest, omnnii_pb.ConnectivityReportResponse> {
    path: "/omnii.OmniiService/ReportConnectivity";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<omnnii_pb.ConnectivityReportRequest>;
    requestDeserialize: grpc.deserialize<omnnii_pb.ConnectivityReportRequest>;
    responseSerialize: grpc.serialize<omnnii_pb.ConnectivityReportResponse>;
    responseDeserialize: grpc.deserialize<omnnii_pb.ConnectivityReportResponse>;
}
interface IOmniiServiceService_ITriggerUpdate extends grpc.MethodDefinition<omnnii_pb.TriggerUpdateRequest, omnnii_pb.TriggerUpdateResponse> {
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
    enroll: grpc.handleUnaryCall<omnnii_pb.EnrollRequest, omnnii_pb.EnrollResponse>;
    refreshToken: grpc.handleUnaryCall<omnnii_pb.RefreshTokenRequest, omnnii_pb.RefreshTokenResponse>;
    heartbeat: grpc.handleUnaryCall<omnnii_pb.HeartbeatRequest, omnnii_pb.HeartbeatResponse>;
    reportUpdates: grpc.handleUnaryCall<omnnii_pb.UpdateReportRequest, omnnii_pb.UpdateReportResponse>;
    reportStats: grpc.handleUnaryCall<omnnii_pb.StatsReportRequest, omnnii_pb.StatsReportResponse>;
    reportConnectivity: grpc.handleUnaryCall<omnnii_pb.ConnectivityReportRequest, omnnii_pb.ConnectivityReportResponse>;
    triggerUpdate: grpc.handleUnaryCall<omnnii_pb.TriggerUpdateRequest, omnnii_pb.TriggerUpdateResponse>;
}

export interface IOmniiServiceClient {
    enroll(request: omnnii_pb.EnrollRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.EnrollResponse) => void): grpc.ClientUnaryCall;
    enroll(request: omnnii_pb.EnrollRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.EnrollResponse) => void): grpc.ClientUnaryCall;
    enroll(request: omnnii_pb.EnrollRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.EnrollResponse) => void): grpc.ClientUnaryCall;
    refreshToken(request: omnnii_pb.RefreshTokenRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.RefreshTokenResponse) => void): grpc.ClientUnaryCall;
    refreshToken(request: omnnii_pb.RefreshTokenRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.RefreshTokenResponse) => void): grpc.ClientUnaryCall;
    refreshToken(request: omnnii_pb.RefreshTokenRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.RefreshTokenResponse) => void): grpc.ClientUnaryCall;
    heartbeat(request: omnnii_pb.HeartbeatRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.HeartbeatResponse) => void): grpc.ClientUnaryCall;
    heartbeat(request: omnnii_pb.HeartbeatRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.HeartbeatResponse) => void): grpc.ClientUnaryCall;
    heartbeat(request: omnnii_pb.HeartbeatRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.HeartbeatResponse) => void): grpc.ClientUnaryCall;
    reportUpdates(request: omnnii_pb.UpdateReportRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.UpdateReportResponse) => void): grpc.ClientUnaryCall;
    reportUpdates(request: omnnii_pb.UpdateReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.UpdateReportResponse) => void): grpc.ClientUnaryCall;
    reportUpdates(request: omnnii_pb.UpdateReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.UpdateReportResponse) => void): grpc.ClientUnaryCall;
    reportStats(request: omnnii_pb.StatsReportRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.StatsReportResponse) => void): grpc.ClientUnaryCall;
    reportStats(request: omnnii_pb.StatsReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.StatsReportResponse) => void): grpc.ClientUnaryCall;
    reportStats(request: omnnii_pb.StatsReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.StatsReportResponse) => void): grpc.ClientUnaryCall;
    reportConnectivity(request: omnnii_pb.ConnectivityReportRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.ConnectivityReportResponse) => void): grpc.ClientUnaryCall;
    reportConnectivity(request: omnnii_pb.ConnectivityReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.ConnectivityReportResponse) => void): grpc.ClientUnaryCall;
    reportConnectivity(request: omnnii_pb.ConnectivityReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.ConnectivityReportResponse) => void): grpc.ClientUnaryCall;
    triggerUpdate(request: omnnii_pb.TriggerUpdateRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.TriggerUpdateResponse) => void): grpc.ClientUnaryCall;
    triggerUpdate(request: omnnii_pb.TriggerUpdateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.TriggerUpdateResponse) => void): grpc.ClientUnaryCall;
    triggerUpdate(request: omnnii_pb.TriggerUpdateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.TriggerUpdateResponse) => void): grpc.ClientUnaryCall;
}

export class OmniiServiceClient extends grpc.Client implements IOmniiServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public enroll(request: omnnii_pb.EnrollRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.EnrollResponse) => void): grpc.ClientUnaryCall;
    public enroll(request: omnnii_pb.EnrollRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.EnrollResponse) => void): grpc.ClientUnaryCall;
    public enroll(request: omnnii_pb.EnrollRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.EnrollResponse) => void): grpc.ClientUnaryCall;
    public refreshToken(request: omnnii_pb.RefreshTokenRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.RefreshTokenResponse) => void): grpc.ClientUnaryCall;
    public refreshToken(request: omnnii_pb.RefreshTokenRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.RefreshTokenResponse) => void): grpc.ClientUnaryCall;
    public refreshToken(request: omnnii_pb.RefreshTokenRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.RefreshTokenResponse) => void): grpc.ClientUnaryCall;
    public heartbeat(request: omnnii_pb.HeartbeatRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.HeartbeatResponse) => void): grpc.ClientUnaryCall;
    public heartbeat(request: omnnii_pb.HeartbeatRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.HeartbeatResponse) => void): grpc.ClientUnaryCall;
    public heartbeat(request: omnnii_pb.HeartbeatRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.HeartbeatResponse) => void): grpc.ClientUnaryCall;
    public reportUpdates(request: omnnii_pb.UpdateReportRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.UpdateReportResponse) => void): grpc.ClientUnaryCall;
    public reportUpdates(request: omnnii_pb.UpdateReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.UpdateReportResponse) => void): grpc.ClientUnaryCall;
    public reportUpdates(request: omnnii_pb.UpdateReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.UpdateReportResponse) => void): grpc.ClientUnaryCall;
    public reportStats(request: omnnii_pb.StatsReportRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.StatsReportResponse) => void): grpc.ClientUnaryCall;
    public reportStats(request: omnnii_pb.StatsReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.StatsReportResponse) => void): grpc.ClientUnaryCall;
    public reportStats(request: omnnii_pb.StatsReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.StatsReportResponse) => void): grpc.ClientUnaryCall;
    public reportConnectivity(request: omnnii_pb.ConnectivityReportRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.ConnectivityReportResponse) => void): grpc.ClientUnaryCall;
    public reportConnectivity(request: omnnii_pb.ConnectivityReportRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.ConnectivityReportResponse) => void): grpc.ClientUnaryCall;
    public reportConnectivity(request: omnnii_pb.ConnectivityReportRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.ConnectivityReportResponse) => void): grpc.ClientUnaryCall;
    public triggerUpdate(request: omnnii_pb.TriggerUpdateRequest, callback: (error: grpc.ServiceError | null, response: omnnii_pb.TriggerUpdateResponse) => void): grpc.ClientUnaryCall;
    public triggerUpdate(request: omnnii_pb.TriggerUpdateRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: omnnii_pb.TriggerUpdateResponse) => void): grpc.ClientUnaryCall;
    public triggerUpdate(request: omnnii_pb.TriggerUpdateRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: omnnii_pb.TriggerUpdateResponse) => void): grpc.ClientUnaryCall;
}
