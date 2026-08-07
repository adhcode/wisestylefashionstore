import { ForbiddenError } from "@/services/auth-service";

export async function withRouteErrors(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return new Response(err.message, { status: 403 });
    }
    console.error(err);
    return new Response("Something went wrong.", { status: 500 });
  }
}
