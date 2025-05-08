// Code from CSV row
protected void parseParameters() {

        parametersParsed = true;

        Parameters parameters = coyoteRequest.getParameters();

        // getCharacterEncoding() may have been overridden to search for
        // hidden form field containing request encoding
        String enc = getCharacterEncoding();

        boolean useBodyEncodingForURI = connector.getUseBodyEncodingForURI();
        if (enc != null) {
            parameters.setEncoding(enc);
            if (useBodyEncodingForURI) {
                parameters.setQueryStringEncoding(enc);
            }
        } else {
            parameters.setEncoding
                (org.apache.coyote.Constants.DEFAULT_CHARACTER_ENCODING);
            if (useBodyEncodingForURI) {
                parameters.setQueryStringEncoding
                    (org.apache.coyote.Constants.DEFAULT_CHARACTER_ENCODING);
            }
        }

        parameters.handleQueryParameters();

        if (usingInputStream || usingReader)
            return;

        if (!getMethod().equalsIgnoreCase("POST"))
            return;

        String contentType = getContentType();
        if (contentType == null)
            contentType = "";
        int semicolon = contentType.indexOf(';');
        if (semicolon >= 0) {
            contentType = contentType.substring(0, semicolon).trim();
        } else {
            contentType = contentType.trim();
        }
        if (!("application/x-www-form-urlencoded".equals(contentType)))
            return;

        int len = getContentLength();

        if (len > 0) {
            int maxPostSize = connector.getMaxPostSize();
            if ((maxPostSize > 0) && (len > maxPostSize)) {
                context.getLogger().info
                    (sm.getString("coyoteRequest.postTooLarge"));
                throw new IllegalStateException("Post too large");
            }
            try {
                byte[] formData = null;
                if (len < CACHED_POST_LEN) {
                    if (postData == null)
                        postData = new byte[CACHED_POST_LEN];
                    formData = postData;
                } else {
                    formData = new byte[len];
                }
                int actualLen = readPostBody(formData, len);
                if (actualLen == len) {
                    parameters.processParameters(formData, 0, len);
                }
            } catch (Throwable t) {
                context.getLogger().warn
                    (sm.getString("coyoteRequest.parseParameters"), t);
            }
        } else if ("chunked".equalsIgnoreCase(
                coyoteRequest.getHeader("transfer-encoding"))) {
            byte[] formData = null;
            try {
                formData = readChunkedPostBody();
            } catch (IOException e) {
                // Client disconnect
                if (context.getLogger().isDebugEnabled()) {
                    context.getLogger().debug(
                            sm.getString("coyoteRequest.parseParameters"), e);
                }
                return;
            }
            if (formData != null) {
                parameters.processParameters(formData, 0, formData.length);
            }
        }

    }


    /**
     * Read post body in an array.
     */
