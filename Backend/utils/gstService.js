const axios = require('axios');

/**
 * Fetch organization data from GST API
 * @param {string} gstNumber - The GST number to lookup
 * @returns {Promise<Object>} Organization data
 */
const fetchGSTData = async (gstNumber) => {
    try {
        if (!process.env.GST_DATA_FETCH) {
            throw new Error('GST_DATA_FETCH environment variable is not set');
        }

        const apiUrl = `http://sheet.gstincheck.co.in/check/${process.env.GST_DATA_FETCH}/${gstNumber}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'JobConnect-Backend/1.0'
            }
        });

        if (!response.data || !response.data.flag) {
            throw new Error(response.data?.message || 'GST data not found');
        }

        const gstData = response.data.data;
        
        // Extract and format the required data
        const organizationData = {
            gstin: gstData.gstin,
            name: gstData.tradeNam || gstData.lgnm, // Trade name or legal name
            legalName: gstData.lgnm,
            tradeName: gstData.tradeNam,
            status: gstData.sts,
            businessType: gstData.ctb, // Constitution of business
            registrationDate: gstData.rgdt,
            address: {
                fullAddress: gstData.pradr?.adr || '',
                building: gstData.pradr?.addr?.bnm || '',
                street: gstData.pradr?.addr?.st || '',
                locality: gstData.pradr?.addr?.loc || '',
                city: gstData.pradr?.addr?.dst || '',
                state: gstData.pradr?.addr?.stcd || '',
                pincode: gstData.pradr?.addr?.pncd || '',
                country: 'India'
            },
            businessActivities: gstData.nba || [],
            lastUpdated: gstData.lstupdt || null
        };

        return {
            success: true,
            data: organizationData,
            rawData: gstData // Keep raw data for reference
        };

    } catch (error) {
        console.error('GST API Error:', error.message);
        
        if (error.response) {
            // API returned an error response
            throw new Error(`GST API Error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('GST API is not responding. Please try again later.');
        } else {
            // Something else went wrong
            throw new Error(error.message || 'Failed to fetch GST data');
        }
    }
};

/**
 * Validate GST number format
 * @param {string} gstNumber - GST number to validate
 * @returns {boolean} True if valid format
 */
const validateGSTFormat = (gstNumber) => {
    // GST format: 15 characters - 2 state code + 10 PAN + 1 entity + 1 check digit + 1 default
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
};

module.exports = {
    fetchGSTData,
    validateGSTFormat
};