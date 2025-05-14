// Code from CSV row
public void testWithVariantRequestOnly() throws Exception {
        params.put(I18nInterceptor.DEFAULT_REQUESTONLY_PARAMETER, "fr_CA_xx");
        interceptor.intercept(mai);

        assertNull(params.get(I18nInterceptor.DEFAULT_PARAMETER)); // should have been removed
        assertNull(session.get(I18nInterceptor.DEFAULT_SESSION_ATTRIBUTE));

        Locale variant = new Locale("fr", "CA", "xx");
        Locale locale = mai.getInvocationContext().getLocale();
        assertNotNull(locale); // should be stored here
        assertEquals(variant, locale);
        assertEquals("xx", locale.getVariant());
    }

    @Test
