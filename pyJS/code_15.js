// Code from CSV row
public void filterWithParameter() throws IOException, ServletException {
		filterWithParameterForMethod("delete", "DELETE");
		filterWithParameterForMethod("put", "PUT");
		filterWithParameterForMethod("patch", "PATCH");
	}

	@Test
