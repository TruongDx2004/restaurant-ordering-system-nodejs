exports.success = (res, data, message = "Success") => {

    return res.status(200).json({
        success: true,
        message,
        data,
        timestamp: new Date()
    });

};

exports.error = (res, message = "Error", status = 500) => {

    return res.status(status).json({
        success: false,
        message,
        timestamp: new Date()
    });

};