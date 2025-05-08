// Code from CSV row
public PlainText decrypt(SecretKey key, CipherText ciphertext)
	    throws EncryptionException, IllegalArgumentException
	{
	    long start = System.nanoTime();  // Current time in nanosecs; used to prevent timing attacks
	    if ( key == null ) {
	        throw new IllegalArgumentException("SecretKey arg may not be null");
	    }
	    if ( ciphertext == null ) {
	        throw new IllegalArgumentException("Ciphertext may arg not be null");
	    }

	    if ( ! CryptoHelper.isAllowedCipherMode(ciphertext.getCipherMode()) ) {
	        // This really should be an illegal argument exception, but it could
	        // mean that a partner encrypted something using a cipher mode that
	        // you do not accept, so it's a bit more complex than that. Also
	        // throwing an IllegalArgumentException doesn't allow us to provide
	        // the two separate error messages or automatically log it.
	        throw new EncryptionException(DECRYPTION_FAILED,
	                "Invalid cipher mode " + ciphertext.getCipherMode() +
	        " not permitted for decryption or encryption operations.");
	    }
	    logger.debug(Logger.EVENT_SUCCESS,
	            "Args valid for JavaEncryptor.decrypt(SecretKey,CipherText): " +
	            ciphertext);

	    PlainText plaintext = null;
	    boolean caughtException = false;
	    int progressMark = 0;
	    try {
	        // First we validate the MAC.
	        boolean valid = CryptoHelper.isCipherTextMACvalid(key, ciphertext);
	        if ( !valid ) {
	            try {
	                // This is going to fail, but we want the same processing
	                // to occur as much as possible so as to prevent timing
	                // attacks. We _could_ just be satisfied by the additional
	                // sleep in the 'finally' clause, but an attacker on the
	                // same server who can run something like 'ps' can tell
	                // CPU time versus when the process is sleeping. Hence we
	                // try to make this as close as possible. Since we know
	                // it is going to fail, we ignore the result and ignore
	                // the (expected) exception.
	                handleDecryption(key, ciphertext); // Ignore return (should fail).
	            } catch(Exception ex) {
	                ;   // Ignore
	            }
	            throw new EncryptionException(DECRYPTION_FAILED,
	                    "Decryption failed because MAC invalid for " +
	                    ciphertext);
	        }
	        progressMark++;
	        // The decryption only counts if the MAC was valid.
	        plaintext = handleDecryption(key, ciphertext);
	        progressMark++;
	    } catch(EncryptionException ex) {
	        caughtException = true;
	        String logMsg = null;
	        switch( progressMark ) {
	        case 1:
	            logMsg = "Decryption failed because MAC invalid. See logged exception for details.";
	            break;
	        case 2:
	            logMsg = "Decryption failed because handleDecryption() failed. See logged exception for details.";
	            break;
	        default:
	            logMsg = "Programming error: unexpected progress mark == " + progressMark;
	        break;
	        }
	        logger.error(Logger.SECURITY_FAILURE, logMsg);
	        throw ex;           // Re-throw
	    }
	    finally {
	        if ( caughtException ) {
	            // The rest of this code is to try to account for any minute differences
	            // in the time it might take for the various reasons that decryption fails
	            // in order to prevent any other possible timing attacks. Perhaps it is
	            // going overboard. If nothing else, if N_SECS is large enough, it might
	            // deter attempted repeated attacks by making them take much longer.
	            long now = System.nanoTime();
	            long elapsed = now - start;
	            final long NANOSECS_IN_SEC = 1000000000L; // nanosec is 10**-9 sec
	            long nSecs = N_SECS * NANOSECS_IN_SEC;  // N seconds in nano seconds
	            if ( elapsed < nSecs ) {
	                // Want to sleep so total time taken is N seconds.
	                long extraSleep = nSecs - elapsed;

	                // 'extraSleep' is in nanoseconds. Need to convert to a millisec
	                // part and nanosec part. Nanosec is 10**-9, millsec is
	                // 10**-3, so divide by (10**-9 / 10**-3), or 10**6 to
	                // convert to from nanoseconds to milliseconds.
	                long millis = extraSleep / 1000000L;
	                long nanos  = (extraSleep - (millis * 1000000L));
	                assert nanos >= 0 && nanos <= Integer.MAX_VALUE :
                            "Nanosecs out of bounds; nanos = " + nanos;
	                try {
	                    Thread.sleep(millis, (int)nanos);
	                } catch(InterruptedException ex) {
	                    ;   // Ignore
	                }
	            } // Else ... time already exceeds N_SECS sec, so do not sleep.
	        }
	    }
	    return plaintext;
	}

    // Handle the actual decryption portion. At this point it is assumed that
    // any MAC has already been validated. (But see "DISCUSS" issue, below.)
