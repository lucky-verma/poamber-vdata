// Code from CSV row
public void execute(FunctionContext context) {
    ResultSender<Object> resultSender = context.getResultSender();

    Cache cache = context.getCache();
    String memberNameOrId = context.getMemberName();

    RegionFunctionArgs regionCreateArgs = (RegionFunctionArgs) context.getArguments();

    if (regionCreateArgs.isSkipIfExists()) {
      Region<Object, Object> region = cache.getRegion(regionCreateArgs.getRegionPath());
      if (region != null) {
        resultSender.lastResult(new CliFunctionResult(memberNameOrId, true,
            CliStrings.format(
                CliStrings.CREATE_REGION__MSG__SKIPPING_0_REGION_PATH_1_ALREADY_EXISTS,
                memberNameOrId, regionCreateArgs.getRegionPath())));
        return;
      }
    }

    try {
      Region<?, ?> createdRegion = createRegion(cache, regionCreateArgs);
      XmlEntity xmlEntity = new XmlEntity(CacheXml.REGION, "name", createdRegion.getName());
      resultSender.lastResult(new CliFunctionResult(memberNameOrId, xmlEntity,
          CliStrings.format(CliStrings.CREATE_REGION__MSG__REGION_0_CREATED_ON_1,
              createdRegion.getFullPath(), memberNameOrId)));
    } catch (IllegalStateException e) {
      String exceptionMsg = e.getMessage();
      String localizedString =
          LocalizedStrings.DiskStore_IS_USED_IN_NONPERSISTENT_REGION.toLocalizedString();
      if (localizedString.equals(e.getMessage())) {
        exceptionMsg = exceptionMsg + " "
            + CliStrings.format(CliStrings.CREATE_REGION__MSG__USE_ONE_OF_THESE_SHORTCUTS_0,
                new Object[] {String.valueOf(RegionCommandsUtils.PERSISTENT_OVERFLOW_SHORTCUTS)});
      }
      resultSender.lastResult(handleException(memberNameOrId, exceptionMsg, null/* do not log */));
    } catch (IllegalArgumentException e) {
      resultSender.lastResult(handleException(memberNameOrId, e.getMessage(), e));
    } catch (RegionExistsException e) {
      String exceptionMsg =
          CliStrings.format(CliStrings.CREATE_REGION__MSG__REGION_PATH_0_ALREADY_EXISTS_ON_1,
              regionCreateArgs.getRegionPath(), memberNameOrId);
      resultSender.lastResult(handleException(memberNameOrId, exceptionMsg, e));
    } catch (Exception e) {
      String exceptionMsg = e.getMessage();
      if (exceptionMsg == null) {
        exceptionMsg = CliUtil.stackTraceAsString(e);
      }
      resultSender.lastResult(handleException(memberNameOrId, exceptionMsg, e));
    }
  }
