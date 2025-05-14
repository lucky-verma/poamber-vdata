// Code from CSV row
public CsrfConfigurer<H> ignoringAntMatchers(String... antPatterns) {
		return new IgnoreCsrfProtectionRegistry().antMatchers(antPatterns).and();
	}

	@SuppressWarnings("unchecked")
	@Override
