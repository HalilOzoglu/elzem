import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "./auth";

const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler; 