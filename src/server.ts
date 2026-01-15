import app from "./app";
import { serverConfig } from "./config/server";
import { startGrpcServer } from "./grpc/server";
import { startCleanupJob } from "./jobs/cleanup";

export function startServer(): void {
	startCleanupJob();

	setTimeout(async () => {
		try {
			await startGrpcServer(serverConfig.grpcPort);
			console.log(`gRPC server started on port ${serverConfig.grpcPort}`);
		} catch (error) {
			console.error("Failed to start gRPC server:", error);
		}
	}, 1000);

	console.log(`Server starting on port ${serverConfig.port}...`);
	Bun.serve({
		port: serverConfig.port,
		fetch(req) {
			return app.fetch(req);
		},
	});
}
