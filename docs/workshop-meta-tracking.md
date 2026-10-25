# Workshop Meta Pixel

Workshop `/workshop` uses Pixel `1126458823106886`. Other public website routes retain their existing configured Pixel. Admin and private confirmation pages remain excluded from public analytics, so private booking tokens and group URLs are not sent to Meta.

Events:
- PageView: once per public navigation after Pixel initialization, including ordinary workshop visits.
- InitiateCheckout: after an order is created and the Razorpay live checkout opens.
- Purchase: only after the server verifies a captured live payment with the matching stored order amount/currency.
- CompleteRegistration: the same verified paid booking, for booking conversion reporting.

Conversions carry actual INR value (299 or 999), the workshop product identifier, and a stable event ID per order/event. No learner name, email, phone, payment signature or private confirmation token is included. Repeat callbacks are suppressed in memory and browser storage. Test payments do not send sales/booking/checkout conversion events; PageView still applies to page visits.

This is browser Pixel tracking, not Conversions API. Browser blocking, immediate navigation or a closed browser/pending payment finalized later by webhook can prevent delivery. Razorpay and the enrolment database are the authoritative sales record. Repeat suppression is per browser, not a global exactly-once delivery guarantee. Existing GTM tags should be audited in the account to ensure they do not independently duplicate the same Pixel/events. Do not add this Pixel a second time through GTM.

Deploy the updated code, then use Meta Events Manager > Test Events or Meta Pixel Helper to verify PageView for the supplied Pixel. Verify conversions during an owner-controlled live payment. Select Purchase for sales optimization or CompleteRegistration for booked-seat reporting; they describe the same sale, so do not sum them as separate purchases. No actual payment or synthetic Purchase was sent to Meta during local verification.

Automated local check: `node tests/workshop/meta-check.cjs`.
