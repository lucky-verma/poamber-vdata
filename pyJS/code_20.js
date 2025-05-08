// Code from CSV row
protected static Object toPoolKey(Map map) {
        Object key = Configurations.getProperty("Id", map);
        return ( key != null) ? key : map;
    }

    /**
     * Register <code>factory</code> in the pool under <code>key</code>.
     *
     * @since 1.1.0
     */
