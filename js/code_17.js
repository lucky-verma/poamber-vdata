// Code from CSV row
public void setUp() throws Exception {
        scimUserProvisioning = mock(ScimUserProvisioning.class);
        expiringCodeStore = mock(ExpiringCodeStore.class);
        passwordValidator = mock(PasswordValidator.class);
        clientDetailsService = mock(ClientDetailsService.class);
        resetPasswordService = new UaaResetPasswordService(scimUserProvisioning, expiringCodeStore, passwordValidator, clientDetailsService);
        PasswordResetEndpoint controller = new PasswordResetEndpoint(resetPasswordService);
        controller.setCodeStore(expiringCodeStore);
        controller.setMessageConverters(new HttpMessageConverter[] { new ExceptionReportHttpMessageConverter() });
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        PasswordChange change = new PasswordChange("id001", "user@example.com", yesterday, null, null);

        when(expiringCodeStore.generateCode(eq("id001"), any(Timestamp.class), eq(null)))
                .thenReturn(new ExpiringCode("secret_code", new Timestamp(System.currentTimeMillis() + UaaResetPasswordService.PASSWORD_RESET_LIFETIME), "id001", null));

        when(expiringCodeStore.generateCode(eq(JsonUtils.writeValueAsString(change)), any(Timestamp.class), eq(null)))
            .thenReturn(new ExpiringCode("secret_code", new Timestamp(System.currentTimeMillis() + UaaResetPasswordService.PASSWORD_RESET_LIFETIME), JsonUtils.writeValueAsString(change), null));
       }

    @Test
