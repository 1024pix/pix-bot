module.exports = {

  test(request, h) {
    const payload = request.payload;

    console.log(payload);

    return {
      "response_type": "in_channel",
      "text": "It works!"
    };
  },

};