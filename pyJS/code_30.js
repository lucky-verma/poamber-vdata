// Code from CSV row
private ControllerInfo parseCInfoString(String cInfoString) {
        Annotations annotation;

        String[] config = cInfoString.split(",");
        if (config.length == 2) {
            String[] pair = config[1].split("=");

            if (pair.length == 2) {
                annotation = DefaultAnnotations.builder()
                        .set(pair[0], pair[1]).build();
            } else {
                print("Wrong format {}", config[1]);
                return null;
            }

            String[] data = config[0].split(":");
            String type = data[0];
            IpAddress ip = IpAddress.valueOf(data[1]);
            int port = Integer.parseInt(data[2]);

            return new ControllerInfo(ip, port, type, annotation);
        } else {
            print(config[0]);
            return new ControllerInfo(config[0]);
        }
    }
