import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function successResponse<T>(
	c: Context,
	data: T,
	status: ContentfulStatusCode = 200,
): Response {
	return c.json(data, status);
}

export function errorResponse(
	c: Context,
	status: ContentfulStatusCode,
	message: string,
): Response {
	return c.json({ message }, status);
}
