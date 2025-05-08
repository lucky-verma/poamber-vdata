// Code from CSV row
public void fail_if_unzipping_stream_outside_target_directory() throws Exception {
    File zip = new File(getClass().getResource("ZipUtilsTest/zip-slip.zip").toURI());
    File toDir = temp.newFolder();

    expectedException.expect(IllegalStateException.class);
    expectedException.expectMessage("Unzipping an entry outside the target directory is not allowed: ../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../tmp/evil.txt");

    try (InputStream input = new FileInputStream(zip)) {
      ZipUtils.unzip(input, toDir);
    }
  }
