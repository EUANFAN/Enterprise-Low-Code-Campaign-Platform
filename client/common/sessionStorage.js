const sessionStorage = god.sessionStorage;

function getSessionByKey(key) {
  return sessionStorage.getItem(`PAGE_VARIABLE:${key}`);
}

function setSessionData(key, value) {
  sessionStorage.setItem(`PAGE_VARIABLE:${key}`, value);
}

export { getSessionByKey, setSessionData, sessionStorage };
