import type { Role } from "@/domain/entities";

// next-auth's own `User`/`Session` types are re-exports of the ones
// declared in @auth/core/types (and JWT from @auth/core/jwt) — augmenting
// "next-auth"/"next-auth/jwt" directly doesn't merge with those, since
// declaration merging only applies to the module a type is actually
// declared in, not a barrel that re-exports it.
declare module "@auth/core/types" {
  interface User {
    role: Role;
    tailorId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      tailorId: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    tailorId: string | null;
  }
}
