const dynamicApiController = require('./dynamicApiController');

module.exports = {
    ...dynamicApiController,
    dynamicApiController,
    libreriaApiController: dynamicApiController
};
