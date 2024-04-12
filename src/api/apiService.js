import axios from "axios";

const baseURL = "https://ecfc-125-63-106-118.ngrok-free.app/";

const instance = axios.create({
  baseURL: baseURL,
  timeout: 100000,
});

const responseBody = (response) => {
  return response;
};

const errorBody = (err) => {
  if (err.code === "ERR_NETWORK") {
    return {
      message: "Please check internet connectivity, then retry!",
      status: 501,
    };
  } else if (err.code === "ERR_BAD_RESPONSE") {
    if (err.response.data.code) {
      return {
        message: "Please contact support, issue in server",
        status: 501,
      };
    } else if (err.response.data.message) {
      return {
        message: err.response.data.message,
        status: err.response.data.status,
      };
    } else {
      return {
        message: "Please contact support, something wrong with server",
        status: 501,
      };
    }
  } else if (err.code === "ERR_BAD_REQUEST") {
    if (err.response.data.message) {
      return {
        message:
          typeof err.response.data.message === `string`
            ? err.response.data.message
            : JSON.stringify(err.response.data.message),
        status: err.response.data.status,
      };
    } else if (typeof err.response.data === "string") {
      return {
        message: err.response.data,
        status: err.response.status,
      };
    } else {
      return {
        message: "Oops, Something went wrong!",
        status: err.response.status,
      };
    }
  }
};

const request = {
  get: (url) => instance.get(url).then(responseBody).catch(errorBody),
  post: (url, body, headers) =>
    instance
      .post(url, body, { ...headers })
      .then(responseBody)
      .catch(errorBody),
  put: (url, body, headers) =>
    instance
      .put(url, body, { ...headers })
      .then(responseBody)
      .catch(errorBody),
  delete: (url) => instance.delete(url).then(responseBody).catch(errorBody),
};

export const IMAGE_GENERATION = {
  generateImage: (payload) =>
    request.post(`${baseURL}` + "predictions", payload),
};
