// Code from CSV row
public void parse(InputStream stream, ContentHandler ignore,
                Metadata metadata, ParseContext context) throws IOException,
                SAXException, TikaException {
            //Test to see if we should avoid parsing
            if (parserState.recursiveParserWrapperHandler.hasHitMaximumEmbeddedResources()) {
                return;
            }
            // Work out what this thing is
            String objectName = getResourceName(metadata, parserState);
            String objectLocation = this.location + objectName;
      
            metadata.add(AbstractRecursiveParserWrapperHandler.EMBEDDED_RESOURCE_PATH, objectLocation);


            //get a fresh handler
            ContentHandler localHandler = parserState.recursiveParserWrapperHandler.getNewContentHandler();
            parserState.recursiveParserWrapperHandler.startEmbeddedDocument(localHandler, metadata);

            Parser preContextParser = context.get(Parser.class);
            context.set(Parser.class, new EmbeddedParserDecorator(getWrappedParser(), objectLocation, parserState));
            long started = System.currentTimeMillis();
            try {
                super.parse(stream, localHandler, metadata, context);
            } catch (SAXException e) {
                boolean wlr = isWriteLimitReached(e);
                if (wlr == true) {
                    metadata.add(WRITE_LIMIT_REACHED, "true");
                } else {
                    if (catchEmbeddedExceptions) {
                        ParserUtils.recordParserFailure(this, e, metadata);
                    } else {
                        throw e;
                    }
                }
            } catch (TikaException e) {
                if (catchEmbeddedExceptions) {
                    ParserUtils.recordParserFailure(this, e, metadata);
                } else {
                    throw e;
                }
            } finally {
                context.set(Parser.class, preContextParser);
                long elapsedMillis = System.currentTimeMillis() - started;
                metadata.set(RecursiveParserWrapperHandler.PARSE_TIME_MILLIS, Long.toString(elapsedMillis));
                parserState.recursiveParserWrapperHandler.endEmbeddedDocument(localHandler, metadata);
            }
        }
    }

    /**
     * This tracks the state of the parse of a single document.
     * In future versions, this will allow the RecursiveParserWrapper to be thread safe.
     */
    private class ParserState {
        private int unknownCount = 0;
        private final AbstractRecursiveParserWrapperHandler recursiveParserWrapperHandler;
        private ParserState(AbstractRecursiveParserWrapperHandler handler) {
            this.recursiveParserWrapperHandler = handler;
        }


    }
}
