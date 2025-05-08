// Code from CSV row
public void unzipping_stream_extracts_subset_of_files() throws IOException {
    InputStream zip = urlToZip().openStream();
    File toDir = temp.newFolder();

    ZipUtils.unzip(zip, toDir, (ZipUtils.ZipEntryFilter)ze -> ze.getName().equals("foo.txt"));
    assertThat(toDir.listFiles()).containsOnly(new File(toDir, "foo.txt"));
  }
