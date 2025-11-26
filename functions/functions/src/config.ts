/**
 * Configuration file for Firebase Functions
 * Contains Google Form and SkipCash configurations extracted from Laravel backend
 */

export interface GoogleFormConfig {
    formUrl: string;
    formFields: {
        orderId: string;
        paymentId: string;
        isPaid: string;
        address: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        scheduledDate: string;
        scheduledTime: string;
        hours: string;
        materials: string;
        cleaners: string;
    };
    timeout: number;
    retryAttempts: number;
}

export interface SkipCashConfig {
    isTestMode: boolean;
    production: {
        apiUrl: string;
        clientId: string;
        apiKey: string;
        secretKey: string;
        webhookKey: string;
    };
    sandbox: {
        apiUrl: string;
        clientId: string;
        apiKey: string;
        secretKey: string;
        webhookKey: string;
    };
}

export interface AppConfig {
    google: GoogleFormConfig;
    skipcash: SkipCashConfig;
    frontend: {
        domain: string;
        successUrl: string;
        cancelUrl: string;
    };
}

// Google Form Configuration
export const googleFormConfig: GoogleFormConfig = {
    formUrl: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSeouZn9dc038aSnDj40SGjGz2uWEbPqV17SAvUHqaW4483yew/formResponse',
    
    formFields: {
        orderId: 'entry.1011936317',
        paymentId: 'entry.358076297',
        isPaid: 'entry.166685531',
        address: 'entry.1609292890',
        customerName: 'entry.1390915916',
        customerEmail: 'entry.1883668962',
        customerPhone: 'entry.994665389',
        scheduledDate: 'entry.2055873333',
        scheduledTime: 'entry.1510790817',
        hours: 'entry.1482962453',
        materials: 'entry.1942996151',
        cleaners: 'entry.1410396487'
    },
    
    timeout: 10,
    retryAttempts: 3
};

// SkipCash Configuration
// SkipCash Configuration
export const skipCashConfig: SkipCashConfig = {
    isTestMode: false,
    
    production: {
        apiUrl: process.env.SKIPCASH_PRODUCTION_API_URL || 'https://api.skipcash.app',
        clientId: process.env.SKIPCASH_PRODUCTION_CLIENT_ID || '',
        apiKey: process.env.SKIPCASH_PRODUCTION_API_KEY || '',
        secretKey: process.env.SKIPCASH_PRODUCTION_SECRET_KEY || '',
        webhookKey: process.env.SKIPCASH_PRODUCTION_WEBHOOK_KEY || ''
    },
    
    sandbox: {
        apiUrl: process.env.SKIPCASH_SANDBOX_API_URL || 'https://skipcashtest.azurewebsites.net',
        clientId: process.env.SKIPCASH_SANDBOX_CLIENT_ID || '',
        apiKey: process.env.SKIPCASH_SANDBOX_API_KEY || '',
        secretKey: process.env.SKIPCASH_SANDBOX_SECRET_KEY || '',
        webhookKey: process.env.SKIPCASH_SANDBOX_WEBHOOK_KEY || ''
    }
};

// Main application configuration
export const appConfig: AppConfig = {
    google: googleFormConfig,
    skipcash: skipCashConfig,
    frontend: {
        domain: 'https://carlamaid.qa',
        successUrl: 'https://carlamaid.qa/booking/success',
        cancelUrl: 'https://carlamaid.qa/booking/cancel'
    }
};

// Helper function to get current SkipCash configuration based on test mode
export function getCurrentSkipCashConfig() {
    return skipCashConfig.isTestMode ? skipCashConfig.sandbox : skipCashConfig.production;
}

// Helper function to get Google Form field value by key
export function getGoogleFormField(fieldKey: keyof GoogleFormConfig['formFields']): string {
    return googleFormConfig.formFields[fieldKey];
}


// Export default configuration
export default appConfig;
