const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("node:crypto");
const User = require("../models/user");
require("dotenv").config();

// === CONFIG ===
// const VERIFF_API_BASE = "https://stationapi.veriff.com";
// const VERIFF_CLIENT = "4014911e-396e-49a5-998e-08115c800fe8"; // x-auth-client (API key)
// const VERIFF_SECRET = "2c0f0b83-9b9e-452e-b8b9-721a4b6d4612"; // shared secret for HMAC signing
const VERIFF_API_BASE = "https://stationapi.veriff.com";
const VERIFF_CLIENT = "a99a41d6-9803-4d20-9ea5-8e053fb951aa";
const VERIFF_SECRET = "38845c3d-5ddd-4492-950b-1b63d350116a";

if (!VERIFF_CLIENT || !VERIFF_SECRET) {
  console.error("Missing VERIFF_CLIENT or VERIFF_SECRET in env");
  process.exit(1);
}

// === HMAC helper ===
function signHmac(payload) {
  let data = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto
    .createHmac("sha256", VERIFF_SECRET)
    .update(Buffer.from(data, "utf8"))
    .digest("hex");
}

// === Veriff helpers ===
async function getVeriffDecision(sessionId) {
  const headers = {
    "X-AUTH-CLIENT": VERIFF_CLIENT,
    "X-HMAC-SIGNATURE": signHmac(sessionId),
  };
  const resp = await axios.get(
    `${VERIFF_API_BASE}/v1/sessions/${sessionId}/decision`,
    { headers }
  );
  return resp.data?.verification ?? null;
}

async function deleteVeriffSession(sessionId) {
  const headers = {
    "X-AUTH-CLIENT": VERIFF_CLIENT,
    "X-HMAC-SIGNATURE": signHmac(sessionId),
  };
  await axios.delete(`${VERIFF_API_BASE}/v1/sessions/${sessionId}`, {
    headers,
  });
}

// === Routes ===

// 1. Save session with cleanup
router.post("/save-session", async (req, res) => {
  try {
    const { walletAddress, sessionId } = req.body;
    if (!walletAddress || !sessionId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const wallet = walletAddress.toLowerCase();
    const existing = await User.findOne({ walletAddress: wallet }).lean();

    if (existing?.sessionId) {
      // check decision for existing session
      const decision = await getVeriffDecision(existing.sessionId);
      console.log("🚀 ~ decision?.status:", decision);
      if (decision?.status !== "approved") {
        // if status is null → delete old session in Veriff
        await deleteVeriffSession(existing.sessionId).catch((err) => {
          console.error(
            "Delete session error:",
            err.response?.data || err.message
          );
        });
      } else {
        // if status exists (approved/declined) → don't overwrite
        return res.status(200).json({
          success: true,
          message: "User already has a completed KYC session",
        });
      }
    }

    // Save new session
    await User.updateOne(
      { walletAddress: wallet },
      { $set: { walletAddress: wallet, sessionId } },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Session saved",
    });
  } catch (err) {
    console.error("Save session error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// 2. Get KYC status
router.get("/status/:wallet", async (req, res) => {
  try {
    const wallet = req.params.wallet?.toLowerCase();
    if (!wallet) {
      return res.status(400).json({ message: "wallet is required" });
    }

    const user = await User.findOne(
      { walletAddress: wallet },
      { sessionId: 1 }
    ).lean();

    if (!user?.sessionId) {
      return res.status(200).json({
        success: true,
        data: {
          walletAddress: wallet,
          decision: null,
        },
      });
    }

    const decision = await getVeriffDecision(user.sessionId);

    return res.status(200).json({
      success: true,
      data: {
        walletAddress: wallet,
        decision: decision === null || !decision?.status ? "pending" : decision.status ,
      },
    });
  } catch (err) {
    console.error("KYC status error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
