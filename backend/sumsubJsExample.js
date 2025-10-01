const axios = require("axios");
const crypto = require("node:crypto");
const fs = require("fs");
const FormData = require("form-data");
const SUMSUB_APP_TOKEN =
  ""; // Example: sbx:uY0CgwELmgUAEyl4hNWxLngb.0WSeQeiYny4WEqmAALEAiK2qTC96fBad - Please don't forget to change when switching to production
const SUMSUB_SECRET_KEY = ""; // Example: Hej2ch71kG2kTd1iIUDZFNsO5C1lh5Gq - Please don't forget to change when switching to production
// These parameters should be used for all requests
const SUMSUB_BASE_URL = "https://api.sumsub.com";

var config = {};
config.baseURL = SUMSUB_BASE_URL;

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error);
});

// Make sure to specify 'Content-Type' header with value of 'application/json' if you're not sending a body for most of requests

// This function creates signature for the request as described here: https://docs.sumsub.com/reference/authentication

function createSignature(config) {
  console.log("Creating a signature for the request...");

  var ts = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac("sha256", SUMSUB_SECRET_KEY);
  signature.update(ts + config.method.toUpperCase() + config.url);

  if (config.data instanceof FormData) {
    signature.update(config.data.getBuffer());
  } else if (config.data) {
    signature.update(config.data);
  }

  config.headers["X-App-Access-Ts"] = ts;
  config.headers["X-App-Access-Sig"] = signature.digest("hex");

  return config;
}

// These functions configure requests for specified method

// https://docs.sumsub.com/reference/get-applicant-data-via-externaluserid
function getApplicantData(externalUserId) {
  console.log("Getting the applicant ...");

  var method = "GET";
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

// https://docs.sumsub.com/reference/create-applicant
function createApplicant(externalUserId, levelName) {
  console.log("Creating an applicant...");

  var method = "post";
  var url = "/resources/applicants?levelName=" + encodeURIComponent(levelName);
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

// https://docs.sumsub.com/reference/get-applicant-review-status
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

// https://docs.sumsub.com/reference/generate-access-token
function createAccessToken(
  externalUserId,
  levelName = "basic-kyc-level",
  ttlInSecs = 600
) {
  console.log("Creating an access token for initializng SDK...");

  var body = {
    userId: externalUserId,
    levelName: levelName,
    ttlInSecs: ttlInSecs,
  };

  var method = "post";
  var url = "/resources/accessTokens/sdk";

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

// This section contains requests to server using configuration functions
// The description of the flow can be found here: https://docs.sumsub.com/reference/get-started-with-api

// Such actions are presented below:
// 1) Creating an applicant
// 2) Adding a document to the applicant
// 3) Getting applicant status
// 4) Getting access tokens for SDKs

async function main() {
  try {
    console.log("Starting the process...");
    // externalUserId = "random-JSToken-" + Math.random().toString(36).substr(2, 9);
    externalUserId =
      "0x808f0597D8B83189ED43d61d40064195F71C0D157".toLowerCase();
    levelName = "basic-kyc-level";
    console.log("External UserID: ", externalUserId);

    // let applicantId;
    // let applicantStatus;
    // let sdkAccessToken;

    let allData = {
      externalUserId: externalUserId,
      applicantId: null,
      applicantStatus: null,
      sdkAccessToken: null,
    };

    try {
      const applicantData = await axios(getApplicantData(externalUserId));
      if (applicantData?.data?.id) {
        console.log("Applicant already exists:", applicantData.data.id);
        allData.applicantId = applicantData.data.id;
      }
    } catch (error) {
      console.log("Error:\n", error.response.data);
      const errorData = error.response.data;
      // {
      // code: 404,
      // correlationId: '34324193a6be08a9003264dd5620d782',
      // description: 'Applicant not found'
      // }
      if (
        errorData.code == 404 &&
        errorData.description == "Applicant not found"
      ) {
        console.log("Applicant not found, creating a new one...");
        const createApplicantResponse = await axios(
          createApplicant(externalUserId, levelName)
        );
        allData.applicantId = createApplicantResponse.data.id;
      }
    }

    console.log("allData.applicantId:", allData.applicantId);

    if (!allData.applicantId) {
      console.log("applicantId not found");
      console.log("All data: ", allData);
      return;
    }

    const getApplicantStatusResponse = await axios(
      getApplicantStatus(allData.applicantId)
    );

    if (getApplicantStatusResponse?.data?.reviewStatus) {
      allData.applicantStatus = getApplicantStatusResponse.data.reviewStatus;
    }

    console.log("allData.applicantStatus:", allData.applicantStatus);
    //const SUMSUB_APPLICANT_STATUSES = [
    //   "init",
    //   "pending",
    //   "prechecked",
    //   "queued",
    //   "completed",
    //   "onHold",
    //   "awaitingService",
    //   "awaitingUser",
    // ];

    if (allData.applicantStatus === "completed") {
      console.log("The applicant has been already processed");

      console.log("All data: ", allData);
      return;
    }

    const createAccessTokenResponse = await axios(
      createAccessToken(externalUserId, levelName, 1200)
    );
    //     🚀 ~ main ~ createAccessTokenResponse: {
    //   token: '_act-sbx-jwt-eyJhbGciOiJub25lIn0.eyJqdGkiOiJfYWN0LXNieC1mNjllYzA0MS02OWMwLTRmYWQtYjEzOS00NGIzY2MyZWNhYmEtdjIiLCJ1cmwiOiJodHRwczovL2FwaS5zdW1zdWIuY29tIn0.-v2',
    //   userId: '0x808f0597d8b83189ed43d61d40064195f71c0d157'
    // }

    if (createAccessTokenResponse?.data?.token) {
      allData.sdkAccessToken = createAccessTokenResponse.data.token;
    }

    console.log("SDK Access Token: ", allData.sdkAccessToken);

    console.log("All data: ", allData);
  } catch (error) {
    console.log("Error:\n", error);
  }
}

main();
