export interface InstanceModel {
	id: string;
	name: string;
	enrollmentCode: string | null;
	enrolledAt: number | null;
	token: string | null;
	status: string;
	lastSeen: number | null;
	createdAt: number;
	updatedAt: number;
}

export interface EnrollmentCodeModel {
	id: string;
	code: string;
	instanceId: string | null;
	createdAt: number;
	expiresAt: number;
	usedAt: number | null;
	deactivatedAt: number | null;
}

export interface InstanceSystemInfoModel {
	id: string;
	instanceId: string;
	supervisor: string | null;
	homeassistant: string | null;
	hassos: string | null;
	docker: string | null;
	hostname: string | null;
	operatingSystem: string | null;
	machine: string | null;
	arch: string | null;
	channel: string | null;
	state: string | null;
	updatedAt: number;
}

export interface InstanceUpdateModel {
	id: string;
	instanceId: string;
	updateType: string;
	slug: string | null;
	name: string | null;
	icon: string | null;
	version: string | null;
	versionLatest: string | null;
	updateAvailable: number | null;
	reportGeneratedAt: number | null;
	panelPath: string | null;
	createdAt: number;
}

export interface HeartbeatModel {
	id: string;
	instanceId: string;
	timestamp: number;
	status: string;
	latencyMs: number | null;
}

export interface ConnectivityCheckModel {
	id: string;
	instanceId: string;
	timestamp: number;
	target: string;
	status: string;
	latencyMs: number | null;
	error: string | null;
	publicIp: string | null;
	ipCountry: string | null;
	ipRegion: string | null;
	ipCity: string | null;
	ipIsp: string | null;
	ipAsn: string | null;
}

export interface InstanceStatsModel {
	id: string;
	instanceId: string;
	generatedAt: number | null;
	cpuPercent: number | null;
	memoryUsage: number | null;
	memoryLimit: number | null;
	memoryPercent: number | null;
	networkTx: number | null;
	networkRx: number | null;
	blkRead: number | null;
	blkWrite: number | null;
	createdAt: number;
}
