/**
 * Firebase Functions API
 * HTTP endpoints for external API access
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { GoogleFormService, SkipCashService, DatabaseService, BookingData, PaymentData, BookingRecord } from './services';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Global options for all functions
setGlobalOptions({ maxInstances: 10 });

// Enhanced CORS middleware with better browser compatibility
const corsMiddleware = (req: any, res: any, next: () => void): void => {
    // Set CORS headers - allow specific domains and fallback to wildcard
    const allowedOrigins = [
        'https://carlamaid.qa',
        'https://www.carlamaid.qa',
        'http://localhost:4200',
        'http://localhost:3000'
    ];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    } else {
        res.set('Access-Control-Allow-Origin', '*');
    }

    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Referer, User-Agent, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    next();
};

// Health check endpoint
export const health = onRequest((request, response): void => {
    corsMiddleware(request, response, () => {
        logger.info("Health check requested", { structuredData: true });
        response.json({
            message: "API is running",
            status: "ok",
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        });
    });
});

// CORS test endpoint
export const corsTest = onRequest((request, response): void => {
    corsMiddleware(request, response, () => {
        logger.info("CORS test requested", {
            origin: request.headers.origin,
            method: request.method,
            headers: request.headers
        });
        response.json({
            message: "CORS test successful",
            origin: request.headers.origin,
            method: request.method,
            timestamp: new Date().toISOString()
        });
    });
});

// API info endpoint
export const apiInfo = onRequest((request, response): void => {
    corsMiddleware(request, response, () => {
        response.json({
            name: "CarlaMaid API",
            version: "1.0.0",
            endpoints: [
                {
                    path: "/health",
                    method: "GET",
                    description: "Health check endpoint"
                },
                {
                    path: "/corsTest",
                    method: "GET",
                    description: "CORS test endpoint"
                },
                {
                    path: "/api/info",
                    method: "GET",
                    description: "API information"
                },
                {
                    path: "/book",
                    method: "POST",
                    description: "Create a booking"
                },
                {
                    path: "/api/check-payment",
                    method: "POST",
                    description: "Check payment status and complete booking"
                },
                {
                    path: "/api/booking/success",
                    method: "GET",
                    description: "Handle successful payment callback"
                },
                {
                    path: "/api/booking/cancel",
                    method: "GET",
                    description: "Handle cancelled payment callback"
                },
                {
                    path: "/api/skipcash/webhook",
                    method: "POST",
                    description: "Handle SkipCash payment notifications"
                },
                {
                    path: "/saveBooking",
                    method: "POST",
                    description: "Save payment and booking info to Google Form"
                },
                {
                    path: "/skipcash/health",
                    method: "GET",
                    description: "SkipCash API health check"
                }
            ],
            documentation: "API documentation coming soon"
        });
    });
});

// Booking endpoint
export const book = onRequest(async (request, response): Promise<void> => {
    corsMiddleware(request, response, async () => {
        logger.info("Booking request received", { structuredData: true });

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                error: "Method not allowed",
                allowedMethods: ["POST"]
            });
            return;
        }

        try {
            const {
                customer_name,
                customer_email,
                customer_phone,
                address,
                service_type,
                cleaners,
                hours,
                materials,
                total,
                payment_method,
                scheduled_date,
                scheduled_time
            } = request.body;

            // Validate required fields
            if (!customer_name || !customer_email || !service_type || !scheduled_date) {
                response.status(400).json({
                    success: false,
                    error: "Customer name, email, service type, and scheduled date are required"
                });
                return;
            }

            // Initialize services
            const databaseService = new DatabaseService();
            const googleFormService = new GoogleFormService();
            const skipCashService = new SkipCashService();

            // Generate unique order ID - using a cleaner format aligned with SkipCash documentation
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
            const orderId = `CARLA_${timestamp}_${randomSuffix}`;

            // Create booking record in database
            const bookingData: Omit<BookingRecord, 'createdAt' | 'updatedAt'> = {
                orderId,
                isPaid: false,
                address: address || '',
                customerName: customer_name,
                customerEmail: customer_email,
                customerPhone: customer_phone || '',
                scheduledDate: scheduled_date,
                scheduledTime: scheduled_time || '',
                hours: hours || 4,
                materials: materials || false,
                cleaners: cleaners || 1,
                serviceType: service_type,
                total: total || 0,
                paymentMethod: payment_method || 'pay_later',
                status: 'pending'
            };

            // Save to database first
            await databaseService.createBooking(bookingData);
            logger.info("Booking saved to database", { orderId, customerEmail: customer_email });

            // Check if payment is required
            const isPaid = payment_method === 'pay_now' && total && total > 0;

            if (isPaid) {
                // Create payment through SkipCash
                logger.info("Creating payment for paid booking", { orderId, total });

                const paymentData: PaymentData = {
                    order_id: orderId,
                    amount: total,
                    customer_name,
                    customer_phone,
                    customer_email,
                    description: `${service_type} cleaning service`,
                    address: address
                };

                logger.info("Payment data being sent to SkipCash:", paymentData);
                logger.info("SkipCash config being used:", {
                    apiUrl: skipCashService['currentConfig'].apiUrl,
                    isTestMode: skipCashService['currentConfig'].isTestMode
                });

                const paymentResult = await skipCashService.createPayment(paymentData);

                if (paymentResult.success) {
                    logger.info("SkipCash payment created successfully", {
                        orderId,
                        paymentUrl: paymentResult.paymentUrl
                    });

                    // Extract payment URL from SkipCash response
                    const paymentUrl = paymentResult.data?.resultObj?.payUrl || paymentResult.paymentUrl;

                    logger.info("Extracted payment URL", {
                        orderId,
                        extractedPaymentUrl: paymentUrl,
                        fromPayUrl: paymentResult.data?.resultObj?.payUrl,
                        fromPaymentUrl: paymentResult.paymentUrl
                    });

                    if (!paymentUrl) {
                        logger.error("Payment URL not found in SkipCash response", {
                            orderId,
                            paymentResult: paymentResult
                        });
                        response.status(500).json({
                            success: false,
                            error: "Payment URL not found"
                        });
                        return;
                    }

                    // Return payment URL for redirect
                    response.status(200)
                        .header('X-Payment-URL', paymentUrl)
                        .header('X-Requires-Redirect', 'true')
                        .json({
                            success: true,
                            message: "Payment created successfully",
                            requiresRedirect: true,
                            redirectUrl: paymentUrl,
                            data: {
                                orderId,
                                paymentUrl: paymentUrl,
                                paymentData: paymentResult.data
                            }
                        });
                    return;
                } else {
                    logger.error("Failed to create SkipCash payment", {
                        orderId,
                        error: paymentResult.error
                    });

                    response.status(500).json({
                        success: false,
                        error: "Failed to create payment",
                        details: paymentResult.error
                    });
                    return;
                }
            } else {
                // Direct booking without payment - submit to Google Form
                logger.info("Creating unpaid booking", { orderId });

                const googleFormBookingData: BookingData = {
                    orderId,
                    isPaid: false,
                    address: address || '',
                    customerName: customer_name,
                    customerEmail: customer_email,
                    customerPhone: customer_phone || '',
                    scheduledDate: scheduled_date,
                    scheduledTime: scheduled_time || '',
                    hours: hours || 4,
                    materials: materials || false,
                    cleaners: cleaners || 1
                };

                try {
                    await googleFormService.submitBooking(googleFormBookingData);

                    logger.info("Unpaid booking submitted to Google Form successfully", { orderId });

                    // Update database status to confirmed
                    await databaseService.updateBookingStatus(orderId, 'confirmed');

                    response.status(201).json({
                        success: true,
                        message: "Booking created successfully (unpaid)",
                        data: {
                            orderId,
                            status: "confirmed",
                            paymentRequired: false
                        }
                    });
                } catch (googleFormError) {
                    logger.error("Failed to submit booking to Google Form", {
                        orderId,
                        error: googleFormError instanceof Error ? googleFormError.message : 'Unknown error'
                    });

                    response.status(500).json({
                        success: false,
                        error: "Failed to create booking",
                        details: "Google Form submission failed"
                    });
                }
            }

        } catch (error) {
            logger.error("Error creating booking", error);
            response.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    });
});

// Check payment status and complete booking endpoint
export const checkPayment = onRequest(async (request, response): Promise<void> => {
    corsMiddleware(request, response, async () => {
        logger.info("Check payment request received", { structuredData: true });

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                error: "Method not allowed",
                allowedMethods: ["POST"]
            });
            return;
        }

        try {
            const { orderId, paymentId, transactionId, statusId } = request.body;

            // Validate required fields
            if (!orderId || !paymentId || !transactionId || statusId === undefined) {
                response.status(400).json({
                    success: false,
                    error: "Missing required fields: orderId, paymentId, transactionId, and statusId are required"
                });
                return;
            }

            // Initialize services
            const databaseService = new DatabaseService();
            const googleFormService = new GoogleFormService();

            // Get booking from database
            const booking = await databaseService.getBookingByOrderId(orderId);
            if (!booking) {
                response.status(404).json({
                    success: false,
                    error: "Booking not found"
                });
                return;
            }

            // Determine if payment is successful (StatusId 2 = paid)
            const isPaid = Number(statusId) === 2;

            logger.info("Processing payment status for booking", {
                orderId,
                paymentId,
                transactionId,
                statusId,
                isPaid,
                customerEmail: booking.customerEmail
            });

            // Update payment information in database
            await databaseService.updatePaymentInfo(orderId, paymentId, transactionId, isPaid);

            // Prepare booking data for Google Form
            const googleFormBookingData: BookingData = {
                orderId,
                paymentId,
                isPaid,
                address: booking.address,
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
                hours: booking.hours,
                materials: booking.materials,
                cleaners: booking.cleaners
            };

            // Submit to Google Form
            try {
                await googleFormService.submitBooking(googleFormBookingData);

                logger.info("Booking completed and submitted to Google Form successfully", {
                    orderId,
                    paymentId,
                    transactionId,
                    isPaid
                });

                response.status(200).json({
                    success: true,
                    message: isPaid ? "Payment successful and booking completed" : "Payment failed but booking updated",
                    data: {
                        orderId,
                        paymentId,
                        transactionId,
                        isPaid,
                        status: isPaid ? "paid_and_confirmed" : "payment_failed",
                        googleFormSubmitted: true
                    }
                });
            } catch (googleFormError) {
                logger.error("Failed to submit completed booking to Google Form", {
                    error: googleFormError instanceof Error ? googleFormError.message : 'Unknown error',
                    orderId,
                    paymentId,
                    transactionId
                });

                response.status(500).json({
                    success: false,
                    error: "Payment processed but Google Form submission failed",
                    details: googleFormError instanceof Error ? googleFormError.message : 'Unknown error'
                });
            }

        } catch (error) {
            logger.error("Error in checkPayment function", error);
            response.status(500).json({
                success: false,
                error: "Internal server error",
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});

// Success endpoint for paid bookings
export const bookingSuccess = onRequest(async (request, response): Promise<void> => {
    corsMiddleware(request, response, async () => {
        logger.info("Booking success callback received", { structuredData: true });

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                error: "Method not allowed",
                allowedMethods: ["GET"]
            });
            return;
        }

        try {
            const {
                orderId,
                status,
                paymentId,
                transactionId,
                amount,
                currency
            } = request.query;

            logger.info("SkipCash return URL parameters received", {
                orderId,
                status,
                paymentId,
                transactionId,
                amount,
                currency
            });

            if (!orderId) {
                response.status(400).json({
                    success: false,
                    error: "Order ID is required"
                });
                return;
            }

            // Verify payment status from SkipCash using the service
            const skipCashService = new SkipCashService();
            const paymentVerification = skipCashService.verifyReturnUrlPaymentStatus(request.query);

            if (!paymentVerification.isValid) {
                logger.warn("Invalid payment status from SkipCash", {
                    orderId,
                    status,
                    error: paymentVerification.error
                });
                response.status(400).json({
                    success: false,
                    error: "Invalid payment status",
                    details: paymentVerification.error
                });
                return;
            }

            // Verify payment status indicates success
            if (paymentVerification.status !== 'success' && paymentVerification.status !== 'paid') {
                logger.warn("Payment status indicates failure", {
                    orderId,
                    status: paymentVerification.status
                });
                response.status(400).json({
                    success: false,
                    error: "Payment was not successful",
                    status: paymentVerification.status
                });
                return;
            }

            logger.info("Processing successful payment for booking", {
                orderId: paymentVerification.orderId,
                status: paymentVerification.status,
                paymentId: paymentVerification.paymentId,
                transactionId: paymentVerification.transactionId,
                amount: paymentVerification.amount,
                currency: paymentVerification.currency
            });

            // Initialize services
            const databaseService = new DatabaseService();
            const googleFormService = new GoogleFormService();

            // Get booking from database
            const booking = await databaseService.getBookingByOrderId(orderId as string);
            if (!booking) {
                response.status(404).json({
                    success: false,
                    error: "Booking not found in database"
                });
                return;
            }

            // Update payment information in database
            await databaseService.updatePaymentInfo(
                orderId as string,
                paymentVerification.paymentId || '',
                paymentVerification.transactionId || '',
                true
            );

            // Create booking data for Google Form submission
            const googleFormBookingData: BookingData = {
                orderId: orderId as string,
                paymentId: paymentVerification.paymentId,
                isPaid: true,
                address: booking.address,
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
                hours: booking.hours,
                materials: booking.materials,
                cleaners: booking.cleaners
            };

            try {
                await googleFormService.submitBooking(googleFormBookingData);

                logger.info("Paid booking submitted to Google Form successfully", { orderId });

                response.status(200).json({
                    success: true,
                    message: "Payment successful and booking created",
                    data: {
                        orderId,
                        status: "paid_and_confirmed"
                    }
                });
            } catch (googleFormError) {
                logger.error("Failed to submit paid booking to Google Form", {
                    orderId,
                    error: googleFormError instanceof Error ? googleFormError.message : 'Unknown error'
                });

                response.status(500).json({
                    success: false,
                    error: "Payment successful but booking creation failed",
                    details: "Google Form submission failed"
                });
            }

        } catch (error) {
            logger.error("Error processing booking success", error);
            response.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    });
});

// Cancel endpoint for cancelled payments
export const bookingCancel = onRequest(async (request, response): Promise<void> => {
    corsMiddleware(request, response, async () => {
        logger.info("Booking cancel callback received", { structuredData: true });

        if (request.method !== 'GET') {
            response.status(405).json({
                success: false,
                error: "Method not allowed",
                allowedMethods: ["GET"]
            });
            return;
        }

        try {
            const {
                orderId,
                status,
                paymentId,
                transactionId,
                amount,
                currency
            } = request.query;

            logger.info("SkipCash cancel URL parameters received", {
                orderId,
                status,
                paymentId,
                transactionId,
                amount,
                currency
            });

            if (!orderId) {
                response.status(400).json({
                    success: false,
                    error: "Order ID is required"
                });
                return;
            }

            // Verify payment status from SkipCash using the service
            const skipCashService = new SkipCashService();
            const paymentVerification = skipCashService.verifyReturnUrlPaymentStatus(request.query);

            if (!paymentVerification.isValid) {
                logger.warn("Invalid payment status from SkipCash", {
                    orderId,
                    status,
                    error: paymentVerification.error
                });
                // Don't fail here - user might have manually cancelled
            }

            // Verify cancellation status from SkipCash
            if (paymentVerification.status !== 'cancelled' && paymentVerification.status !== 'canceled') {
                logger.warn("Payment status indicates success, not cancellation", {
                    orderId,
                    status: paymentVerification.status
                });
                // Don't fail here - user might have manually cancelled
            }

            logger.info("Processing cancelled payment for booking", {
                orderId: paymentVerification.orderId,
                status: paymentVerification.status,
                paymentId: paymentVerification.paymentId,
                transactionId: paymentVerification.transactionId,
                amount: paymentVerification.amount,
                currency: paymentVerification.currency
            });

            // Initialize services
            const databaseService = new DatabaseService();
            const googleFormService = new GoogleFormService();

            // Get booking from database
            const booking = await databaseService.getBookingByOrderId(orderId as string);
            if (!booking) {
                response.status(404).json({
                    success: false,
                    error: "Booking not found in database"
                });
                return;
            }

            // Update payment information in database (marked as unpaid)
            if (paymentVerification.paymentId && paymentVerification.transactionId) {
                await databaseService.updatePaymentInfo(
                    orderId as string,
                    paymentVerification.paymentId,
                    paymentVerification.transactionId,
                    false
                );
            }

            // Create booking data for Google Form submission (marked as unpaid)
            const googleFormBookingData: BookingData = {
                orderId: orderId as string,
                paymentId: paymentVerification.paymentId,
                isPaid: false,
                address: booking.address,
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
                hours: booking.hours,
                materials: booking.materials,
                cleaners: booking.cleaners
            };

            try {
                await googleFormService.submitBooking(googleFormBookingData);

                logger.info("Cancelled booking submitted to Google Form successfully", { orderId });

                response.status(200).json({
                    success: true,
                    message: "Payment cancelled and booking created as unpaid",
                    data: {
                        orderId,
                        status: "cancelled_and_unpaid"
                    }
                });
            } catch (googleFormError) {
                logger.error("Failed to submit cancelled booking to Google Form", {
                    orderId,
                    error: googleFormError instanceof Error ? googleFormError.message : 'Unknown error'
                });

                response.status(500).json({
                    success: false,
                    error: "Payment cancelled but booking creation failed",
                    details: "Google Form submission failed"
                });
            }

        } catch (error) {
            logger.error("Error processing booking cancel", error);
            response.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    });
});

// SkipCash webhook endpoint for payment notifications
export const skipCashWebhook = onRequest(async (request, response): Promise<void> => {
    corsMiddleware(request, response, async () => {
        logger.info("SkipCash webhook received", { structuredData: true });

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                error: "Method not allowed",
                allowedMethods: ["POST"]
            });
            return;
        }

        try {
            const webhookData = request.body;
            const authHeader = request.headers.authorization;

            logger.info("Processing SkipCash webhook", { webhookData, authHeader });

            // Initialize services
            const skipCashService = new SkipCashService();
            const googleFormService = new GoogleFormService();

            // Verify webhook signature
            const isValidSignature = skipCashService.verifyWebhookSignature(webhookData, authHeader || '');

            if (!isValidSignature) {
                logger.error("Invalid webhook signature", { webhookData, authHeader });
                response.status(401).json({
                    success: false,
                    error: "Invalid signature"
                });
                return;
            }

            // Extract payment information
            const {
                PaymentId,
                Amount,
                StatusId,
                TransactionId
            } = webhookData;

            // Determine if payment is successful (StatusId 2 = paid)
            const isPaid = Number(StatusId) === 2;

            // Convert Amount to number as GoogleFormService expects it
            const amountNumber = parseFloat(Amount) || 0;

            logger.info("Payment status update", {
                paymentId: PaymentId,
                amount: Amount,
                amountNumber,
                statusId: StatusId,
                transactionId: TransactionId,
                isPaid
            });

            // Update Google Form with payment status
            try {
                await googleFormService.updatePaymentStatus(
                    TransactionId,
                    PaymentId,
                    isPaid,
                    StatusId,
                    amountNumber
                );

                logger.info("Google Form updated successfully for payment", {
                    transactionId: TransactionId,
                    paymentId: PaymentId,
                    isPaid,
                    statusId: StatusId,
                    amount: Amount,
                    amountNumber
                });

                response.status(200).json({
                    success: true,
                    message: "Webhook processed successfully",
                    data: {
                        paymentId: PaymentId,
                        transactionId: TransactionId,
                        isPaid,
                        statusId: StatusId
                    }
                });
            } catch (googleFormError) {
                logger.error("Failed to update Google Form for payment", {
                    error: googleFormError instanceof Error ? googleFormError.message : 'Unknown error',
                    transactionId: TransactionId,
                    paymentId: PaymentId
                });

                response.status(500).json({
                    success: false,
                    error: "Webhook processed but Google Form update failed",
                    details: "Google Form submission failed"
                });
            }

        } catch (error) {
            logger.error("Error processing SkipCash webhook", error);
            response.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    });
});

// Save payment and booking information endpoint
export const saveBooking = onRequest(async (request, response): Promise<void> => {
    // Apply CORS headers and handle preflight requests
    corsMiddleware(request, response, async () => {

        if (request.method !== 'POST') {
            response.status(405).json({
                success: false,
                error: "Method not allowed",
                allowedMethods: ["POST"]
            });
            return;
        }

        try {
            const { orderId, transactionId, statusId, bookingInfo } = request.body;

            // Validate required fields (transactionId is now optional)
            if (!orderId || !statusId || (!transactionId && !bookingInfo)) {
                response.status(400).json({
                    success: false,
                    error: "Missing required fields: orderId, statusId, and bookingInfo are required"
                });
                return;
            }

            // Determine if payment is successful (StatusId 2 = paid)
            const isPaid = Number(statusId) === 2;

            logger.info("Processing booking", {
                orderId,
                transactionId: transactionId || 'none',
                statusId,
                isPaid,
                customerEmail: bookingInfo?.customerEmail || 'unknown',
                action: transactionId ? 'update' : 'create'
            });

            // Create services instances
            const googleFormService = new GoogleFormService();
            const databaseService = new DatabaseService();

            let finalBookingInfo: any = { ...bookingInfo };

            if (transactionId) {
                // UPDATE: Update existing booking with payment info
                await databaseService.updatePaymentInfo(orderId, transactionId, transactionId, isPaid);

                // Get the existing booking to ensure we have the most accurate data for Google Form
                const existingBooking = await databaseService.getBookingByOrderId(orderId);
                if (existingBooking) {
                    // Merge existing data with request data, prioritizing existing data for critical fields
                    finalBookingInfo = {
                        address: existingBooking.address || '',
                        customerName: existingBooking.customerName || '',
                        customerEmail: existingBooking.customerEmail || '',
                        customerPhone: existingBooking.customerPhone || '',
                        scheduledDate: existingBooking.scheduledDate || '',
                        scheduledTime: existingBooking.scheduledTime || '',
                        hours: existingBooking.hours || 1,
                        materials: existingBooking.materials !== undefined ? existingBooking.materials : false,
                        cleaners: existingBooking.cleaners || 1
                    };
                }
            } else {
                // CREATE: Create new booking
                const bookingData: Omit<BookingRecord, 'createdAt' | 'updatedAt'> = {
                    orderId,
                    isPaid,
                    address: finalBookingInfo.address || '',
                    customerName: finalBookingInfo.customerName || '',
                    customerEmail: finalBookingInfo.customerEmail || '',
                    customerPhone: finalBookingInfo.customerPhone || '',
                    scheduledDate: finalBookingInfo.scheduledDate || '',
                    scheduledTime: finalBookingInfo.scheduledTime || '',
                    hours: parseInt(finalBookingInfo.hours) || 1,
                    materials: Boolean(finalBookingInfo.materials),
                    cleaners: parseInt(finalBookingInfo.cleaners) || 1,
                    serviceType: 'cleaning', // Add default or from bookingInfo
                    status: isPaid ? 'confirmed' : 'pending'
                };

                await databaseService.createBooking(bookingData);
            }

            // Prepare booking data for Google Form using the final merged data
            const googleFormBookingData: BookingData = {
                orderId,
                paymentId: transactionId || '', // Use transactionId if available, otherwise empty
                isPaid,
                address: finalBookingInfo.address || '',
                customerName: finalBookingInfo.customerName || '',
                customerEmail: finalBookingInfo.customerEmail || '',
                customerPhone: finalBookingInfo.customerPhone || '',
                scheduledDate: finalBookingInfo.scheduledDate || '',
                scheduledTime: finalBookingInfo.scheduledTime || '',
                hours: parseInt(finalBookingInfo.hours) || 1,
                materials: Boolean(finalBookingInfo.materials),
                cleaners: parseInt(finalBookingInfo.cleaners) || 1
            };

            // Submit to Google Form
            try {
                const success = await googleFormService.submitBooking(googleFormBookingData);

                if (success) {
                    logger.info("Booking info saved to Google Form successfully", {
                        orderId,
                        transactionId: transactionId || 'none',
                        customerEmail: finalBookingInfo.customerEmail
                    });

                    response.status(200).json({
                        success: true,
                        message: "Payment and booking info saved successfully",
                        data: {
                            orderId,
                            transactionId: transactionId || 'none',
                            statusId,
                            isPaid,
                            googleFormSubmitted: true
                        }
                    });
                } else {
                    throw new Error("Google Form submission returned false");
                }

            } catch (googleFormError) {
                logger.error("Failed to save booking info to Google Form", {
                    error: googleFormError instanceof Error ? googleFormError.message : 'Unknown error',
                    orderId,
                    transactionId: transactionId || 'none',
                    customerEmail: finalBookingInfo.customerEmail
                });

                response.status(500).json({
                    success: false,
                    error: "Failed to save booking info to Google Form",
                    details: googleFormError instanceof Error ? googleFormError.message : 'Unknown error'
                });
            }

        } catch (error) {
            logger.error("Error in saveBooking function", error);
            response.status(500).json({
                success: false,
                error: "Internal server error",
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
