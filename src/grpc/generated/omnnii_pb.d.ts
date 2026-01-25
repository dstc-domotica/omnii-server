// package: omnii
// file: omnnii.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class EnrollRequest extends jspb.Message { 
    getCode(): string;
    setCode(value: string): EnrollRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EnrollRequest.AsObject;
    static toObject(includeInstance: boolean, msg: EnrollRequest): EnrollRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EnrollRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EnrollRequest;
    static deserializeBinaryFromReader(message: EnrollRequest, reader: jspb.BinaryReader): EnrollRequest;
}

export namespace EnrollRequest {
    export type AsObject = {
        code: string,
    }
}

export class EnrollResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): EnrollResponse;
    getError(): string;
    setError(value: string): EnrollResponse;
    getInstanceId(): string;
    setInstanceId(value: string): EnrollResponse;
    getAccessToken(): string;
    setAccessToken(value: string): EnrollResponse;
    getRefreshToken(): string;
    setRefreshToken(value: string): EnrollResponse;
    getAccessTokenExpiresAt(): number;
    setAccessTokenExpiresAt(value: number): EnrollResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): EnrollResponse.AsObject;
    static toObject(includeInstance: boolean, msg: EnrollResponse): EnrollResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: EnrollResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): EnrollResponse;
    static deserializeBinaryFromReader(message: EnrollResponse, reader: jspb.BinaryReader): EnrollResponse;
}

export namespace EnrollResponse {
    export type AsObject = {
        success: boolean,
        error: string,
        instanceId: string,
        accessToken: string,
        refreshToken: string,
        accessTokenExpiresAt: number,
    }
}

export class RefreshTokenRequest extends jspb.Message { 
    getRefreshToken(): string;
    setRefreshToken(value: string): RefreshTokenRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RefreshTokenRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RefreshTokenRequest): RefreshTokenRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RefreshTokenRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RefreshTokenRequest;
    static deserializeBinaryFromReader(message: RefreshTokenRequest, reader: jspb.BinaryReader): RefreshTokenRequest;
}

export namespace RefreshTokenRequest {
    export type AsObject = {
        refreshToken: string,
    }
}

export class RefreshTokenResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): RefreshTokenResponse;
    getError(): string;
    setError(value: string): RefreshTokenResponse;
    getAccessToken(): string;
    setAccessToken(value: string): RefreshTokenResponse;
    getRefreshToken(): string;
    setRefreshToken(value: string): RefreshTokenResponse;
    getAccessTokenExpiresAt(): number;
    setAccessTokenExpiresAt(value: number): RefreshTokenResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RefreshTokenResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RefreshTokenResponse): RefreshTokenResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RefreshTokenResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RefreshTokenResponse;
    static deserializeBinaryFromReader(message: RefreshTokenResponse, reader: jspb.BinaryReader): RefreshTokenResponse;
}

export namespace RefreshTokenResponse {
    export type AsObject = {
        success: boolean,
        error: string,
        accessToken: string,
        refreshToken: string,
        accessTokenExpiresAt: number,
    }
}

export class SystemInfo extends jspb.Message { 
    getSupervisor(): string;
    setSupervisor(value: string): SystemInfo;
    getHomeassistant(): string;
    setHomeassistant(value: string): SystemInfo;
    getHassos(): string;
    setHassos(value: string): SystemInfo;
    getDocker(): string;
    setDocker(value: string): SystemInfo;
    getHostname(): string;
    setHostname(value: string): SystemInfo;
    getOperatingSystem(): string;
    setOperatingSystem(value: string): SystemInfo;
    getMachine(): string;
    setMachine(value: string): SystemInfo;
    getArch(): string;
    setArch(value: string): SystemInfo;
    getChannel(): string;
    setChannel(value: string): SystemInfo;
    getState(): string;
    setState(value: string): SystemInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SystemInfo.AsObject;
    static toObject(includeInstance: boolean, msg: SystemInfo): SystemInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SystemInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SystemInfo;
    static deserializeBinaryFromReader(message: SystemInfo, reader: jspb.BinaryReader): SystemInfo;
}

export namespace SystemInfo {
    export type AsObject = {
        supervisor: string,
        homeassistant: string,
        hassos: string,
        docker: string,
        hostname: string,
        operatingSystem: string,
        machine: string,
        arch: string,
        channel: string,
        state: string,
    }
}

export class HeartbeatRequest extends jspb.Message { 

    hasSystemInfo(): boolean;
    clearSystemInfo(): void;
    getSystemInfo(): SystemInfo | undefined;
    setSystemInfo(value?: SystemInfo): HeartbeatRequest;
    getClientTimestamp(): number;
    setClientTimestamp(value: number): HeartbeatRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HeartbeatRequest.AsObject;
    static toObject(includeInstance: boolean, msg: HeartbeatRequest): HeartbeatRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HeartbeatRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HeartbeatRequest;
    static deserializeBinaryFromReader(message: HeartbeatRequest, reader: jspb.BinaryReader): HeartbeatRequest;
}

export namespace HeartbeatRequest {
    export type AsObject = {
        systemInfo?: SystemInfo.AsObject,
        clientTimestamp: number,
    }
}

export class HeartbeatResponse extends jspb.Message { 
    getAlive(): boolean;
    setAlive(value: boolean): HeartbeatResponse;
    getTime(): number;
    setTime(value: number): HeartbeatResponse;
    getLatencyMs(): number;
    setLatencyMs(value: number): HeartbeatResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): HeartbeatResponse.AsObject;
    static toObject(includeInstance: boolean, msg: HeartbeatResponse): HeartbeatResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: HeartbeatResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): HeartbeatResponse;
    static deserializeBinaryFromReader(message: HeartbeatResponse, reader: jspb.BinaryReader): HeartbeatResponse;
}

export namespace HeartbeatResponse {
    export type AsObject = {
        alive: boolean,
        time: number,
        latencyMs: number,
    }
}

export class ComponentUpdate extends jspb.Message { 
    getComponentType(): string;
    setComponentType(value: string): ComponentUpdate;
    getSlug(): string;
    setSlug(value: string): ComponentUpdate;
    getName(): string;
    setName(value: string): ComponentUpdate;
    getVersion(): string;
    setVersion(value: string): ComponentUpdate;
    getVersionLatest(): string;
    setVersionLatest(value: string): ComponentUpdate;
    getUpdateAvailable(): boolean;
    setUpdateAvailable(value: boolean): ComponentUpdate;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ComponentUpdate.AsObject;
    static toObject(includeInstance: boolean, msg: ComponentUpdate): ComponentUpdate.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ComponentUpdate, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ComponentUpdate;
    static deserializeBinaryFromReader(message: ComponentUpdate, reader: jspb.BinaryReader): ComponentUpdate;
}

export namespace ComponentUpdate {
    export type AsObject = {
        componentType: string,
        slug: string,
        name: string,
        version: string,
        versionLatest: string,
        updateAvailable: boolean,
    }
}

export class UpdateReport extends jspb.Message { 
    getGeneratedAt(): number;
    setGeneratedAt(value: number): UpdateReport;
    clearComponentsList(): void;
    getComponentsList(): Array<ComponentUpdate>;
    setComponentsList(value: Array<ComponentUpdate>): UpdateReport;
    addComponents(value?: ComponentUpdate, index?: number): ComponentUpdate;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateReport.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateReport): UpdateReport.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateReport, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateReport;
    static deserializeBinaryFromReader(message: UpdateReport, reader: jspb.BinaryReader): UpdateReport;
}

export namespace UpdateReport {
    export type AsObject = {
        generatedAt: number,
        componentsList: Array<ComponentUpdate.AsObject>,
    }
}

export class UpdateReportRequest extends jspb.Message { 

    hasReport(): boolean;
    clearReport(): void;
    getReport(): UpdateReport | undefined;
    setReport(value?: UpdateReport): UpdateReportRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateReportRequest.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateReportRequest): UpdateReportRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateReportRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateReportRequest;
    static deserializeBinaryFromReader(message: UpdateReportRequest, reader: jspb.BinaryReader): UpdateReportRequest;
}

export namespace UpdateReportRequest {
    export type AsObject = {
        report?: UpdateReport.AsObject,
    }
}

export class UpdateReportResponse extends jspb.Message { 
    getAccepted(): boolean;
    setAccepted(value: boolean): UpdateReportResponse;
    getMessage(): string;
    setMessage(value: string): UpdateReportResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UpdateReportResponse.AsObject;
    static toObject(includeInstance: boolean, msg: UpdateReportResponse): UpdateReportResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UpdateReportResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UpdateReportResponse;
    static deserializeBinaryFromReader(message: UpdateReportResponse, reader: jspb.BinaryReader): UpdateReportResponse;
}

export namespace UpdateReportResponse {
    export type AsObject = {
        accepted: boolean,
        message: string,
    }
}

export class CoreStats extends jspb.Message { 
    getCpuPercent(): number;
    setCpuPercent(value: number): CoreStats;
    getMemoryUsage(): number;
    setMemoryUsage(value: number): CoreStats;
    getMemoryLimit(): number;
    setMemoryLimit(value: number): CoreStats;
    getMemoryPercent(): number;
    setMemoryPercent(value: number): CoreStats;
    getNetworkTx(): number;
    setNetworkTx(value: number): CoreStats;
    getNetworkRx(): number;
    setNetworkRx(value: number): CoreStats;
    getBlkRead(): number;
    setBlkRead(value: number): CoreStats;
    getBlkWrite(): number;
    setBlkWrite(value: number): CoreStats;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CoreStats.AsObject;
    static toObject(includeInstance: boolean, msg: CoreStats): CoreStats.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CoreStats, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CoreStats;
    static deserializeBinaryFromReader(message: CoreStats, reader: jspb.BinaryReader): CoreStats;
}

export namespace CoreStats {
    export type AsObject = {
        cpuPercent: number,
        memoryUsage: number,
        memoryLimit: number,
        memoryPercent: number,
        networkTx: number,
        networkRx: number,
        blkRead: number,
        blkWrite: number,
    }
}

export class StatsReport extends jspb.Message { 
    getGeneratedAt(): number;
    setGeneratedAt(value: number): StatsReport;

    hasStats(): boolean;
    clearStats(): void;
    getStats(): CoreStats | undefined;
    setStats(value?: CoreStats): StatsReport;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StatsReport.AsObject;
    static toObject(includeInstance: boolean, msg: StatsReport): StatsReport.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StatsReport, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StatsReport;
    static deserializeBinaryFromReader(message: StatsReport, reader: jspb.BinaryReader): StatsReport;
}

export namespace StatsReport {
    export type AsObject = {
        generatedAt: number,
        stats?: CoreStats.AsObject,
    }
}

export class StatsReportRequest extends jspb.Message { 

    hasReport(): boolean;
    clearReport(): void;
    getReport(): StatsReport | undefined;
    setReport(value?: StatsReport): StatsReportRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StatsReportRequest.AsObject;
    static toObject(includeInstance: boolean, msg: StatsReportRequest): StatsReportRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StatsReportRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StatsReportRequest;
    static deserializeBinaryFromReader(message: StatsReportRequest, reader: jspb.BinaryReader): StatsReportRequest;
}

export namespace StatsReportRequest {
    export type AsObject = {
        report?: StatsReport.AsObject,
    }
}

export class StatsReportResponse extends jspb.Message { 
    getAccepted(): boolean;
    setAccepted(value: boolean): StatsReportResponse;
    getMessage(): string;
    setMessage(value: string): StatsReportResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StatsReportResponse.AsObject;
    static toObject(includeInstance: boolean, msg: StatsReportResponse): StatsReportResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StatsReportResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StatsReportResponse;
    static deserializeBinaryFromReader(message: StatsReportResponse, reader: jspb.BinaryReader): StatsReportResponse;
}

export namespace StatsReportResponse {
    export type AsObject = {
        accepted: boolean,
        message: string,
    }
}

export class ConnectivityCheck extends jspb.Message { 
    getTarget(): string;
    setTarget(value: string): ConnectivityCheck;
    getStatus(): string;
    setStatus(value: string): ConnectivityCheck;
    getLatencyMs(): number;
    setLatencyMs(value: number): ConnectivityCheck;
    getError(): string;
    setError(value: string): ConnectivityCheck;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConnectivityCheck.AsObject;
    static toObject(includeInstance: boolean, msg: ConnectivityCheck): ConnectivityCheck.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConnectivityCheck, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConnectivityCheck;
    static deserializeBinaryFromReader(message: ConnectivityCheck, reader: jspb.BinaryReader): ConnectivityCheck;
}

export namespace ConnectivityCheck {
    export type AsObject = {
        target: string,
        status: string,
        latencyMs: number,
        error: string,
    }
}

export class ConnectivityReportRequest extends jspb.Message { 
    getClientTimestamp(): number;
    setClientTimestamp(value: number): ConnectivityReportRequest;
    getPublicIp(): string;
    setPublicIp(value: string): ConnectivityReportRequest;
    clearChecksList(): void;
    getChecksList(): Array<ConnectivityCheck>;
    setChecksList(value: Array<ConnectivityCheck>): ConnectivityReportRequest;
    addChecks(value?: ConnectivityCheck, index?: number): ConnectivityCheck;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConnectivityReportRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ConnectivityReportRequest): ConnectivityReportRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConnectivityReportRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConnectivityReportRequest;
    static deserializeBinaryFromReader(message: ConnectivityReportRequest, reader: jspb.BinaryReader): ConnectivityReportRequest;
}

export namespace ConnectivityReportRequest {
    export type AsObject = {
        clientTimestamp: number,
        publicIp: string,
        checksList: Array<ConnectivityCheck.AsObject>,
    }
}

export class ConnectivityReportResponse extends jspb.Message { 
    getAccepted(): boolean;
    setAccepted(value: boolean): ConnectivityReportResponse;
    getMessage(): string;
    setMessage(value: string): ConnectivityReportResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConnectivityReportResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ConnectivityReportResponse): ConnectivityReportResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConnectivityReportResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConnectivityReportResponse;
    static deserializeBinaryFromReader(message: ConnectivityReportResponse, reader: jspb.BinaryReader): ConnectivityReportResponse;
}

export namespace ConnectivityReportResponse {
    export type AsObject = {
        accepted: boolean,
        message: string,
    }
}

export class TriggerUpdateRequest extends jspb.Message { 
    getUpdateType(): string;
    setUpdateType(value: string): TriggerUpdateRequest;
    getAddonSlug(): string;
    setAddonSlug(value: string): TriggerUpdateRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TriggerUpdateRequest.AsObject;
    static toObject(includeInstance: boolean, msg: TriggerUpdateRequest): TriggerUpdateRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TriggerUpdateRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TriggerUpdateRequest;
    static deserializeBinaryFromReader(message: TriggerUpdateRequest, reader: jspb.BinaryReader): TriggerUpdateRequest;
}

export namespace TriggerUpdateRequest {
    export type AsObject = {
        updateType: string,
        addonSlug: string,
    }
}

export class TriggerUpdateResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): TriggerUpdateResponse;
    getError(): string;
    setError(value: string): TriggerUpdateResponse;
    getMessage(): string;
    setMessage(value: string): TriggerUpdateResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): TriggerUpdateResponse.AsObject;
    static toObject(includeInstance: boolean, msg: TriggerUpdateResponse): TriggerUpdateResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: TriggerUpdateResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): TriggerUpdateResponse;
    static deserializeBinaryFromReader(message: TriggerUpdateResponse, reader: jspb.BinaryReader): TriggerUpdateResponse;
}

export namespace TriggerUpdateResponse {
    export type AsObject = {
        success: boolean,
        error: string,
        message: string,
    }
}
