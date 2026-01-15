import { env } from "./env";

function normalizeHost(host: string): string {
	if (host.startsWith("http://") || host.startsWith("https://")) {
		return host;
	}
	return `http://${host}`;
}

export function getHostForGrpc(): string {
	const serverHost = env.SERVER_HOST;
	if (serverHost.startsWith("http://") || serverHost.startsWith("https://")) {
		try {
			return new URL(serverHost).hostname;
		} catch {
			return serverHost.replace(/^https?:\/\//, "");
		}
	}
	return serverHost;
}

export function buildApiBaseUrl(): string {
	const serverHost = env.SERVER_HOST;
	if (serverHost.startsWith("http://") || serverHost.startsWith("https://")) {
		return serverHost;
	}
	return `${normalizeHost(serverHost)}:${env.PORT}`;
}

export const serverConfig = {
	host: env.SERVER_HOST,
	port: env.PORT,
	grpcPort: env.GRPC_PORT,
};
