import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  try {
    const authKey = process.env.TRANSLOADIT_AUTH_KEY;
    const authSecret = process.env.TRANSLOADIT_AUTH_SECRET;
    const templateId = process.env.TRANSLOADIT_TEMPLATE_ID;

    if (!authKey || !authSecret || !templateId) {
      return NextResponse.json(
        { error: "Missing Transloadit environment variables." },
        { status: 500 }
      );
    }

    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const params = {
      auth: {
        key: authKey,
        expires,
      },
      template_id: templateId,
    };

    const paramsString = JSON.stringify(params);
    const signature =
      "sha384:" +
      crypto.createHmac("sha384", authSecret).update(paramsString).digest("hex");

    return NextResponse.json({
      params,
      signature,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create upload signature." },
      { status: 500 }
    );
  }
}