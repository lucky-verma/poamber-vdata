// Code from CSV row
public StandardInterceptUrlRegistry access(String... attributes) {
			addMapping(requestMatchers, SecurityConfig.createList(attributes));
			return UrlAuthorizationConfigurer.this.REGISTRY;
		}
	}
}
