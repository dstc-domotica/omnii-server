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
	static toObject(
		includeInstance: boolean,
		msg: EnrollRequest,
	): EnrollRequest.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: EnrollRequest,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): EnrollRequest;
	static deserializeBinaryFromReader(
		message: EnrollRequest,
		reader: jspb.BinaryReader,
	): EnrollRequest;
}

export namespace EnrollRequest {
	export type AsObject = {
		code: string;
	};
}

export class EnrollResponse extends jspb.Message {
	getSuccess(): boolean;
	setSuccess(value: boolean): EnrollResponse;
	getError(): string;
	setError(value: string): EnrollResponse;
	getInstanceId(): string;
	setInstanceId(value: string): EnrollResponse;
	getToken(): string;
	setToken(value: string): EnrollResponse;

	serializeBinary(): Uint8Array;
	toObject(includeInstance?: boolean): EnrollResponse.AsObject;
	static toObject(
		includeInstance: boolean,
		msg: EnrollResponse,
	): EnrollResponse.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: EnrollResponse,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): EnrollResponse;
	static deserializeBinaryFromReader(
		message: EnrollResponse,
		reader: jspb.BinaryReader,
	): EnrollResponse;
}

export namespace EnrollResponse {
	export type AsObject = {
		success: boolean;
		error: string;
		instanceId: string;
		token: string;
	};
}

export class HandshakeRequest extends jspb.Message {
	getAddonId(): string;
	setAddonId(value: string): HandshakeRequest;
	getToken(): string;
	setToken(value: string): HandshakeRequest;

	serializeBinary(): Uint8Array;
	toObject(includeInstance?: boolean): HandshakeRequest.AsObject;
	static toObject(
		includeInstance: boolean,
		msg: HandshakeRequest,
	): HandshakeRequest.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: HandshakeRequest,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): HandshakeRequest;
	static deserializeBinaryFromReader(
		message: HandshakeRequest,
		reader: jspb.BinaryReader,
	): HandshakeRequest;
}

export namespace HandshakeRequest {
	export type AsObject = {
		addonId: string;
		token: string;
	};
}

export class HandshakeResponse extends jspb.Message {
	getSessionId(): string;
	setSessionId(value: string): HandshakeResponse;
	getStatus(): string;
	setStatus(value: string): HandshakeResponse;

	serializeBinary(): Uint8Array;
	toObject(includeInstance?: boolean): HandshakeResponse.AsObject;
	static toObject(
		includeInstance: boolean,
		msg: HandshakeResponse,
	): HandshakeResponse.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: HandshakeResponse,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): HandshakeResponse;
	static deserializeBinaryFromReader(
		message: HandshakeResponse,
		reader: jspb.BinaryReader,
	): HandshakeResponse;
}

export namespace HandshakeResponse {
	export type AsObject = {
		sessionId: string;
		status: string;
	};
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
	static toObject(
		includeInstance: boolean,
		msg: SystemInfo,
	): SystemInfo.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: SystemInfo,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): SystemInfo;
	static deserializeBinaryFromReader(
		message: SystemInfo,
		reader: jspb.BinaryReader,
	): SystemInfo;
}

export namespace SystemInfo {
	export type AsObject = {
		supervisor: string;
		homeassistant: string;
		hassos: string;
		docker: string;
		hostname: string;
		operatingSystem: string;
		machine: string;
		arch: string;
		channel: string;
		state: string;
	};
}

export class HeartbeatRequest extends jspb.Message {
	getSessionId(): string;
	setSessionId(value: string): HeartbeatRequest;

	hasSystemInfo(): boolean;
	clearSystemInfo(): void;
	getSystemInfo(): SystemInfo | undefined;
	setSystemInfo(value?: SystemInfo): HeartbeatRequest;
	getClientTimestamp(): number;
	setClientTimestamp(value: number): HeartbeatRequest;

	serializeBinary(): Uint8Array;
	toObject(includeInstance?: boolean): HeartbeatRequest.AsObject;
	static toObject(
		includeInstance: boolean,
		msg: HeartbeatRequest,
	): HeartbeatRequest.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: HeartbeatRequest,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): HeartbeatRequest;
	static deserializeBinaryFromReader(
		message: HeartbeatRequest,
		reader: jspb.BinaryReader,
	): HeartbeatRequest;
}

export namespace HeartbeatRequest {
	export type AsObject = {
		sessionId: string;
		systemInfo?: SystemInfo.AsObject;
		clientTimestamp: number;
	};
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
	static toObject(
		includeInstance: boolean,
		msg: HeartbeatResponse,
	): HeartbeatResponse.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: HeartbeatResponse,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): HeartbeatResponse;
	static deserializeBinaryFromReader(
		message: HeartbeatResponse,
		reader: jspb.BinaryReader,
	): HeartbeatResponse;
}

export namespace HeartbeatResponse {
	export type AsObject = {
		alive: boolean;
		time: number;
		latencyMs: number;
	};
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
	static toObject(
		includeInstance: boolean,
		msg: ComponentUpdate,
	): ComponentUpdate.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: ComponentUpdate,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): ComponentUpdate;
	static deserializeBinaryFromReader(
		message: ComponentUpdate,
		reader: jspb.BinaryReader,
	): ComponentUpdate;
}

export namespace ComponentUpdate {
	export type AsObject = {
		componentType: string;
		slug: string;
		name: string;
		version: string;
		versionLatest: string;
		updateAvailable: boolean;
	};
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
	static toObject(
		includeInstance: boolean,
		msg: UpdateReport,
	): UpdateReport.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: UpdateReport,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): UpdateReport;
	static deserializeBinaryFromReader(
		message: UpdateReport,
		reader: jspb.BinaryReader,
	): UpdateReport;
}

export namespace UpdateReport {
	export type AsObject = {
		generatedAt: number;
		componentsList: Array<ComponentUpdate.AsObject>;
	};
}

export class UpdateReportRequest extends jspb.Message {
	getSessionId(): string;
	setSessionId(value: string): UpdateReportRequest;

	hasReport(): boolean;
	clearReport(): void;
	getReport(): UpdateReport | undefined;
	setReport(value?: UpdateReport): UpdateReportRequest;

	serializeBinary(): Uint8Array;
	toObject(includeInstance?: boolean): UpdateReportRequest.AsObject;
	static toObject(
		includeInstance: boolean,
		msg: UpdateReportRequest,
	): UpdateReportRequest.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: UpdateReportRequest,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): UpdateReportRequest;
	static deserializeBinaryFromReader(
		message: UpdateReportRequest,
		reader: jspb.BinaryReader,
	): UpdateReportRequest;
}

export namespace UpdateReportRequest {
	export type AsObject = {
		sessionId: string;
		report?: UpdateReport.AsObject;
	};
}

export class UpdateReportResponse extends jspb.Message {
	getAccepted(): boolean;
	setAccepted(value: boolean): UpdateReportResponse;
	getMessage(): string;
	setMessage(value: string): UpdateReportResponse;

	serializeBinary(): Uint8Array;
	toObject(includeInstance?: boolean): UpdateReportResponse.AsObject;
	static toObject(
		includeInstance: boolean,
		msg: UpdateReportResponse,
	): UpdateReportResponse.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: UpdateReportResponse,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): UpdateReportResponse;
	static deserializeBinaryFromReader(
		message: UpdateReportResponse,
		reader: jspb.BinaryReader,
	): UpdateReportResponse;
}

export namespace UpdateReportResponse {
	export type AsObject = {
		accepted: boolean;
		message: string;
	};
}

export class TriggerUpdateRequest extends jspb.Message {
	getSessionId(): string;
	setSessionId(value: string): TriggerUpdateRequest;
	getUpdateType(): string;
	setUpdateType(value: string): TriggerUpdateRequest;
	getAddonSlug(): string;
	setAddonSlug(value: string): TriggerUpdateRequest;

	serializeBinary(): Uint8Array;
	toObject(includeInstance?: boolean): TriggerUpdateRequest.AsObject;
	static toObject(
		includeInstance: boolean,
		msg: TriggerUpdateRequest,
	): TriggerUpdateRequest.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: TriggerUpdateRequest,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): TriggerUpdateRequest;
	static deserializeBinaryFromReader(
		message: TriggerUpdateRequest,
		reader: jspb.BinaryReader,
	): TriggerUpdateRequest;
}

export namespace TriggerUpdateRequest {
	export type AsObject = {
		sessionId: string;
		updateType: string;
		addonSlug: string;
	};
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
	static toObject(
		includeInstance: boolean,
		msg: TriggerUpdateResponse,
	): TriggerUpdateResponse.AsObject;
	static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
	static extensionsBinary: {
		[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
	};
	static serializeBinaryToWriter(
		message: TriggerUpdateResponse,
		writer: jspb.BinaryWriter,
	): void;
	static deserializeBinary(bytes: Uint8Array): TriggerUpdateResponse;
	static deserializeBinaryFromReader(
		message: TriggerUpdateResponse,
		reader: jspb.BinaryReader,
	): TriggerUpdateResponse;
}

export namespace TriggerUpdateResponse {
	export type AsObject = {
		success: boolean;
		error: string;
		message: string;
	};
}
