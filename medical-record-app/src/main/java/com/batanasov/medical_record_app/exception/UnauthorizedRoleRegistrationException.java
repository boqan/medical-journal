package com.batanasov.medical_record_app.exception;

public class UnauthorizedRoleRegistrationException extends RuntimeException {
    public UnauthorizedRoleRegistrationException(String message) {
        super(message);
    }
}
