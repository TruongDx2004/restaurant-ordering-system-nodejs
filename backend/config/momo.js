module.exports = {
    // Bộ key Sandbox
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180810',
    accessKey: process.env.MOMO_ACCESS_KEY || 'klm05TvNBqg7n6Ju',
    secretKey: process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1n71ytrS157V26v8M6d',
    apiEndpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/customer/payment-result',
    ipnUrl: process.env.MOMO_IPN_URL || 'https://a026-2402-800-6370-3741-4c83-dc7e-11e3-baca.ngrok-free.app/api/payments/momo-ipn',
};
