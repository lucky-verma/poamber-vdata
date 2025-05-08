// Code from CSV row
private boolean breakKeepAliveLoop(SocketWrapperBase<?> socketWrapper) {
        openSocket = keepAlive;
        // Do sendfile as needed: add socket to sendfile and end
        if (sendfileData != null && !getErrorState().isError()) {
            sendfileData.keepAlive = keepAlive;
            switch (socketWrapper.processSendfile(sendfileData)) {
            case DONE:
                // If sendfile is complete, no need to break keep-alive loop
                sendfileData = null;
                return false;
            case PENDING:
                return true;
            case ERROR:
                // Write failed
                if (log.isDebugEnabled()) {
                    log.debug(sm.getString("http11processor.sendfile.error"));
                }
                setErrorState(ErrorState.CLOSE_CONNECTION_NOW, null);
                return true;
            }
        }
        return false;
    }


    @Override
