const createResponse = (success, data = {}, error = null) => {
    return {
      success,
      data,
      error
    };
  };
  
  module.exports = createResponse;
  