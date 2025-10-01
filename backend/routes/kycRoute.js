const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("node:crypto");
const FormData = require("form-data");
require("dotenv").config();

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = process.env.SUMSUB_BASE_URL;

var config = {};
config.baseURL = SUMSUB_BASE_URL;

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error);
});

// This function creates signature for the request as described here: https://developers.sumsub.com/api-reference/#app-tokens

function createSignature(config) {
  console.log("Creating a signature for the request...");

  var ts = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac("sha256", SUMSUB_SECRET_KEY);
  console.log("signature created");
  signature.update(ts + config.method.toUpperCase() + config.url);
  console.log("signature updated");
  if (config.data instanceof FormData) {
    signature.update(config.data.getBuffer());
  } else if (config.data) {
    signature.update(config.data);
  }
  console.log("if run");

  config.headers["X-App-Access-Ts"] = ts;
  config.headers["X-App-Access-Sig"] = signature.digest("hex");
  console.log("config headers set");
  return config;
}

// These functions configure requests for specified method

// https://developers.sumsub.com/api-reference/#creating-an-applicant
function createApplicant(externalUserId, levelName) {
  console.log("Creating an applicant...");

  var method = "post";
  var url = "/resources/applicants?levelName=basic-kyc-level";
  var ts = Math.floor(Date.now() / 1000);

  var body = {
    externalUserId: externalUserId,
  };

  var headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-App-Token": SUMSUB_APP_TOKEN,
  };
  config.method = method;
  config.url = url;
  config.headers = headers;
  config.data = JSON.stringify(body);

  return config;
}

function getApplicantStatus(applicantId) {
  console.log("Getting the applicant status...");

  var method = "get";
  var url = `/resources/applicants/${applicantId}/status`;

  var headers = {
    Accept: "application/json",
    "X-App-Token": SUMSUB_APP_TOKEN,
  };

  config.method = method;
  config.url = url;
  config.headers = headers;
  config.data = null;

  return config;
}

function getApplicant(externalUserId) {
  console.log("Getting the applicant ...");

  var method = "get";
  var url = `/resources/applicants/-;externalUserId=${externalUserId}/one`;

  var headers = {
    Accept: "application/json",
    "X-App-Token": SUMSUB_APP_TOKEN,
  };

  config.method = method;
  config.url = url;
  config.headers = headers;
  config.data = null;

  return config;
}

function createAccessToken(
  externalUserId,
  levelName = "basic-kyc-level",
  ttlInSecs = 600
) {
  console.log("Creating an access token for initializng SDK...");

  var method = "post";
  var url = `/resources/accessTokens?userId=${externalUserId}&ttlInSecs=${ttlInSecs}&levelName=${levelName}`;

  var headers = {
    Accept: "application/json",
    "X-App-Token": SUMSUB_APP_TOKEN,
  };

  config.method = method;
  config.url = url;
  config.headers = headers;
  config.data = null;

  return config;
}

router.post("/kycverification", async (req, res) => {
  try {
    const { externalUserId } = req.body;
    let applicantIdObj = {};
    const levelName = "basic-kyc-level";
    console.log("External UserID: ", externalUserId);

    let response = await axios(createApplicant(externalUserId, levelName))
      .then(function (response) {
        console.log("Response:\n", response.data);
        return response;
      })
      .catch(function (error) {
        console.log("Error inside kyc:\n", error.response);
      });
    console.log("then catch works");
    const applicantId = response.data.id;
    applicantIdObj.applicantId = applicantId;
    console.log("ApplicantID: ", applicantId);

    response = await axios(getApplicantStatus(applicantId))
      .then(function (response) {
        console.log("Response:\n", response.data);
        return response;
      })
      .catch(function (error) {
        console.log("Error:\n", error.response.data);
      });

    response = await axios(createAccessToken(externalUserId, levelName, 1200))
      .then(function (response) {
        applicantIdObj.response = response.data;
        console.log("Response:\n", applicantIdObj);

        res.status(200).json(applicantIdObj);
      })
      .catch(function (error) {
        console.log("Error:\n", error.response.data);
      });
  } catch (error) {
    console.log("🚀", error);
    res.status(500).json(error);
  }
});

router.post("/generateAccessToken", async (req, res) => {
  try {
    const { externalUserId } = req.body;
    const levelName = "basic-kyc-level";
    console.log("External UserID: ", externalUserId);
    let response = await axios(
      createAccessToken(externalUserId, levelName, 1200)
    )
      .then(function (response) {
        console.log("Response:\n", response.data);

        res.status(200).json(response.data);
      })
      .catch(function (error) {
        console.log("Error:\n", error.response.data);
      });
  } catch (error) {
    console.log("🚀", error);
    res.status(500).json(error);
  }
});

router.get("/getApplicantStatus", async (req, res) => {
  try {
    const { applicantId } = req.query;
    console.log("applicantId", applicantId);
    let reviewStatusObj = {};
    let response = await axios(getApplicantStatus(applicantId))
      .then(function (response) {
        console.log("Response:\n", response.data);
        reviewStatusObj.reviewStatus = response.data.reviewStatus;
        res.status(200).json(reviewStatusObj);
      })
      .catch(function (error) {
        let err = {
          reviewStatus: "notFound",
        };
        console.log("Error:\n", err);
        res.status(200).json(err);
      });
  } catch (error) {
    console.log("🚀", error);

    res.status(500).json(error);
  }
});

router.get("/getApplicant", async (req, res) => {
  try {
    const { externalUserId } = req.query;
    const idObj = {};
    await axios(getApplicant(externalUserId))
      .then(function (response) {
        console.log("Response:\n", response.data.id);
        idObj.applicantId = response.data.id;
        res.status(200).json(idObj);
      })
      .catch(function (error) {
        idObj.applicantId = null;
        console.log("Error:\n", idObj);
        res.status(200).json(idObj);
      });
  } catch (error) {
    console.log("🚀", error);

    res.status(500).json(error);
  }
});

module.exports = router;
