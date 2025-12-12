# CarlaMaid Payment Integration - Production Guide

## Overview
This document provides a comprehensive guide to the CarlaMaid payment integration system using SkipCash payment gateway. The integration is fully implemented and production-ready.

## Architecture Overview

### Frontend Components
- **Book Now Component** (`/book-now`): Main booking form with payment integration
- **Payment Success Component** (`/book-now/success`): Handles successful payments
- **Payment Cancel Component** (`/book-now/cancel`): Handles cancelled payments
- **Payment Success Popup**: Modal for payment confirmation

### Backend Services
- **Standalone Server** (`production/standalone-server.js`): Express.js backend with SkipCash integration
- **Payment Service**: Angular service for payment operations
- **Booking Service**: Handles booking creation and management
- **Payment Data Service**: Manages payment data persistence

### Payment Gateway
- **SkipCash**: Primary payment gateway for Qatar market
- **Production API**: `https://api.skipcash.app`
- **Webhook Support**: Real-time payment status updates

## Payment Flow

### 1. Booking Initiation
```
User fills booking form → Form validation → Payment creation request
```

### 2. Payment Creation
```
Frontend → Backend API → SkipCash API → Payment URL generation
```

### 3. Payment Processing
```
User redirected to SkipCash → Payment completion → Callback to success/cancel page
```

### 4. Payment Confirmation
```
Webhook notification → Backend processing → Booking creation → Google Form submission
```

## Configuration Files

### Environment Configuration
- **Development**: `src/environments/environment.ts`
- **Production**: `src/environments/environment.prod.ts`

### Backend Configuration
- **Server**: `production/standalone-server.js`
- **Port**: 4000 (configurable via environment variable)

## Production Settings

### SkipCash Configuration
```javascript
// ⚠️ SECURITY: Never hardcode credentials. Use environment variables.
production: {
  apiUrl: 'https://api.skipcash.app',
  clientId: process.env.SKIPCASH_PRODUCTION_CLIENT_ID || 'YOUR_PRODUCTION_CLIENT_ID',
  apiKey: process.env.SKIPCASH_PRODUCTION_API_KEY || 'YOUR_PRODUCTION_API_KEY',
  secretKey: process.env.SKIPCASH_PRODUCTION_SECRET_KEY || 'YOUR_PRODUCTION_SECRET_KEY',
  webhookKey: process.env.SKIPCASH_PRODUCTION_WEBHOOK_KEY || 'YOUR_PRODUCTION_WEBHOOK_KEY'
}
```

### API Endpoints
- **Payment Creation**: `POST /api/skipcash/payment/create`
- **Payment Status**: `GET /api/payment/status-skip-cash/:orderId`
- **Payment Callback**: `POST /api/payment/callback`
- **Health Check**: `GET /api/skipcash/health`

### Frontend URLs
- **Success Page**: `https://carlamaid.qa/book-now/success`
- **Cancel Page**: `https://carlamaid.qa/book-now/cancel`
- **Backend API**: `https://api.carlamaid.qa/api`

## Security Features

### 1. HMAC-SHA256 Signature
- All payment requests are signed using SkipCash secret key
- Prevents request tampering and ensures authenticity

### 2. Webhook Verification
- Webhook signatures are verified before processing
- Ensures webhook data integrity

### 3. Input Validation
- Comprehensive validation of all payment data
- Email format validation
- Amount range validation (0 - 100,000 QAR)

### 4. CORS Configuration
- Proper CORS headers for production domains
- Secure cross-origin requests

## Error Handling

### Payment Creation Errors
- Missing required fields
- Invalid email format
- SkipCash API errors
- Network timeouts

### Payment Status Errors
- Invalid order ID
- Backend API failures
- SkipCash connectivity issues

### Webhook Processing Errors
- Invalid signature
- Missing required data
- Processing failures

## Monitoring & Logging

### Payment Attempts
- All payment attempts are logged with timestamps
- Customer information and amount tracking
- Order ID generation tracking

### Payment Results
- Success/failure status logging
- Error message capture
- Transaction ID tracking

### Webhook Processing
- Webhook payload logging
- Processing status tracking
- Error condition logging

## Google Form Integration

### Form Submission
- Automatic booking data submission to Google Form
- Payment status tracking
- Customer information capture

### Form Fields
- Order ID, Payment ID, Payment Status
- Customer details (name, email, phone)
- Service details (type, hours, materials)
- Scheduling information

## Production Deployment

### 1. Build Production Frontend
```bash
npm run build:prod
```

### 2. Start Production Backend
```bash
npm run backend:prod
```

### 3. Environment Variables
```bash
NODE_ENV=production
PORT=4000
GOOGLE_FORM_URL=https://docs.google.com/forms/...
```

### 4. SSL Configuration
- Ensure HTTPS is enabled for all production URLs
- Valid SSL certificates for domains
- Secure webhook endpoints

## Testing

### Payment Flow Testing
1. **Test Booking**: Create booking with test payment
2. **Payment Simulation**: Use SkipCash test mode
3. **Webhook Testing**: Verify webhook processing
4. **Error Scenarios**: Test various error conditions

### Integration Testing
1. **Frontend-Backend**: Verify API communication
2. **SkipCash Integration**: Test payment creation and status
3. **Google Form**: Verify data submission
4. **Error Handling**: Test error scenarios

## Troubleshooting

### Common Issues

#### 1. Payment Creation Fails
- Check SkipCash API credentials
- Verify signature calculation
- Check network connectivity
- Review request payload

#### 2. Webhook Not Received
- Verify webhook URL configuration
- Check webhook key
- Ensure endpoint is accessible
- Review SkipCash webhook settings

#### 3. Payment Status Not Updated
- Check order ID format
- Verify SkipCash API response
- Review backend error logs
- Check database connectivity

### Debug Steps
1. Check backend logs for errors
2. Verify SkipCash API responses
3. Test webhook endpoint manually
4. Review frontend console logs
5. Check network requests in browser

## Performance Optimization

### 1. Caching
- Payment status caching
- API response caching
- Static asset optimization

### 2. Database Optimization
- Efficient query patterns
- Index optimization
- Connection pooling

### 3. CDN Integration
- Static asset delivery
- Global content distribution
- Performance monitoring

## Backup & Recovery

### 1. Data Backup
- Regular database backups
- Payment data archiving
- Configuration backup

### 2. Disaster Recovery
- Failover procedures
- Data restoration processes
- Service recovery steps

## Compliance & Security

### 1. PCI Compliance
- Secure payment data handling
- Encryption standards
- Access control

### 2. Data Protection
- Customer data privacy
- GDPR compliance
- Data retention policies

## Support & Maintenance

### 1. Monitoring
- Payment success rates
- Error rate tracking
- Performance metrics
- Uptime monitoring

### 2. Updates
- Regular security updates
- API version updates
- Feature enhancements
- Bug fixes

## Conclusion

The CarlaMaid payment integration is fully implemented and production-ready. The system provides:

- Secure payment processing via SkipCash
- Real-time payment status updates
- Comprehensive error handling
- Google Form integration
- Production-grade security
- Monitoring and logging capabilities

For production deployment, ensure all environment variables are properly configured, SSL certificates are valid, and monitoring is in place.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready

