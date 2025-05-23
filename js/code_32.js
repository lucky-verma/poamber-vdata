// Code from CSV row
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        Assert.isInstanceOf(UsernamePasswordAuthenticationToken.class, authentication,
            messages.getMessage("LdapAuthenticationProvider.onlySupports",
                "Only UsernamePasswordAuthenticationToken is supported"));

        final UsernamePasswordAuthenticationToken userToken = (UsernamePasswordAuthenticationToken)authentication;

        String username = userToken.getName();
        String password = (String) authentication.getCredentials();

        if (logger.isDebugEnabled()) {
            logger.debug("Processing authentication request for user: " + username);
        }

        if (!StringUtils.hasLength(username)) {
            throw new BadCredentialsException(messages.getMessage("LdapAuthenticationProvider.emptyUsername",
                    "Empty Username"));
        }

        Assert.notNull(password, "Null password was supplied in authentication token");

        DirContextOperations userData = doAuthentication(userToken);

        UserDetails user = userDetailsContextMapper.mapUserFromContext(userData, authentication.getName(),
                    loadUserAuthorities(userData, authentication.getName(), (String)authentication.getCredentials()));

        return createSuccessfulAuthentication(userToken, user);
    }
