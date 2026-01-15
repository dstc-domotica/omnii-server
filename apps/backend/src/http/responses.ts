import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export interface ErrorPayload {
	success: false;
	error: {
		message: string;
		code?: string;
	};
}

export interface SuccessPayload<T> {
	success: true;
	data: T;
}

export function successResponse<T>(
	c: Context,
	data: T,
	status: ContentfulStatusCode = 200,
): Response {
	return c.json({ success: true, data }, status);
}

export function errorResponse(
	c: Context,
	status: ContentfulStatusCode,
	message: string,
	code?: string,
): Response {
	return c.json(
		{
			success: false,
			error: {
				message,
				code,
			},
		},
		status,
	);
}
