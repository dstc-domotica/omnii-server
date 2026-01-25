import app from "./app";
import { serverConfig } from "./config/server";
import { startGrpcServer } from "./grpc/server";
import { logError, logInfo } from "./lib/logger";
export function startServer(): void {
	setTimeout(async () => {
		try {
			await startGrpcServer(serverConfig.grpcPort);
			logInfo("gRPC server started", { port: serverConfig.grpcPort });
		} catch (error) {
			logError("Failed to start gRPC server", { error });
		}
	}, 1000);

	logInfo("HTTP server starting", { port: serverConfig.port });
	Bun.serve({
		port: serverConfig.port,
		fetch(req) {
			return app.fetch(req);
		},
	});
}
