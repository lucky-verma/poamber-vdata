// Code from CSV row
public void commence(ServletRequest request, ServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        HttpServletRequest hrequest = (HttpServletRequest)request;
        HttpServletResponse hresponse = (HttpServletResponse)response;
        FedizContext fedContext = federationConfig.getFedizContext();
        LOG.debug("Federation context: {}", fedContext);
        
        // Check to see if it is a metadata request
        MetadataDocumentHandler mdHandler = new MetadataDocumentHandler(fedContext);
        if (mdHandler.canHandleRequest(hrequest)) {
            mdHandler.handleRequest(hrequest, hresponse);
            return;
        }
        
        String redirectUrl = null;
        try {
            FedizProcessor wfProc = 
                FedizProcessorFactory.newFedizProcessor(fedContext.getProtocol());
            
            RedirectionResponse redirectionResponse =
                wfProc.createSignInRequest(hrequest, fedContext);
            redirectUrl = redirectionResponse.getRedirectionURL();
            
            if (redirectUrl == null) {
                LOG.warn("Failed to create SignInRequest.");
                hresponse.sendError(
                        HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create SignInRequest.");
            }
            
            Map<String, String> headers = redirectionResponse.getHeaders();
            if (!headers.isEmpty()) {
                for (Entry<String, String> entry : headers.entrySet()) {
                    hresponse.addHeader(entry.getKey(), entry.getValue());
                }
            }
            
        } catch (ProcessingException ex) {
            System.err.println("Failed to create SignInRequest: " + ex.getMessage());
            LOG.warn("Failed to create SignInRequest: " + ex.getMessage());
            hresponse.sendError(
                               HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create SignInRequest.");
        }
        
        preCommence(hrequest, hresponse);
        if (LOG.isInfoEnabled()) {
            LOG.info("Redirecting to IDP: " + redirectUrl);
        }
        hresponse.sendRedirect(redirectUrl);
        
    }
