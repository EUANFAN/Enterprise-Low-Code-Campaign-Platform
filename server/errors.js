const { ErrorNumbers } = require('./constants');
class AuthenticationError extends Error {
  errNumber = ErrorNumbers.AUTHENTICATINO_FAILED;
}

class InvalidParameterError extends Error {
  errNumber = ErrorNumbers.INVALID_PARAMETER;
}

class PermissionDeniedError extends Error {
  errNumber = ErrorNumbers.PERMISION_DENIED;
  _ownerId;

  constructor(message, ownerId) {
    super(message);

    this._ownerId = ownerId;
  }

  getOwnerId = () => {
    return this._ownerId;
  };
}
module.exports = {
  AuthenticationError,
  InvalidParameterError,
  PermissionDeniedError,
};
