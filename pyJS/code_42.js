// Code from CSV row
public void execute(FunctionContext context) {
    RegionFunctionContext rfc = (RegionFunctionContext) context;
    Set<String> keys = (Set<String>) rfc.getFilter();

    // Get local (primary) data for the context
    Region primaryDataSet = PartitionRegionHelper.getLocalDataForContext(rfc);

    if (this.cache.getLogger().fineEnabled()) {
      StringBuilder builder = new StringBuilder();
      builder.append("Function ").append(ID).append(" received request to touch ")
          .append(primaryDataSet.getFullPath()).append("->").append(keys);
      this.cache.getLogger().fine(builder.toString());
    }

    // Retrieve each value to update the lastAccessedTime.
    // Note: getAll is not supported on LocalDataSet.
    for (String key : keys) {
      primaryDataSet.get(key);
    }

    // Return result to get around NPE in LocalResultCollectorImpl
    context.getResultSender().lastResult(true);
  }
