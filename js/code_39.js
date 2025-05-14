// Code from CSV row
public void testCorruptFileThenSnapshotAndRestore() throws ExecutionException, InterruptedException, IOException {
        int numDocs = scaledRandomIntBetween(100, 1000);
        internalCluster().ensureAtLeastNumDataNodes(2);

        assertAcked(prepareCreate("test").setSettings(ImmutableSettings.builder()
                        .put(IndexMetaData.SETTING_NUMBER_OF_REPLICAS, "0") // no replicas for this test
                        .put(MergePolicyModule.MERGE_POLICY_TYPE_KEY, NoMergePolicyProvider.class)
                        .put(MockFSDirectoryService.CHECK_INDEX_ON_CLOSE, false) // no checkindex - we corrupt shards on purpose
                        .put(EngineConfig.INDEX_FAIL_ON_CORRUPTION_SETTING, true)
                        .put(TranslogService.INDEX_TRANSLOG_DISABLE_FLUSH, true) // no translog based flush - it might change the .liv / segments.N files
                        .put("indices.recovery.concurrent_streams", 10)
        ));
        ensureGreen();
        IndexRequestBuilder[] builders = new IndexRequestBuilder[numDocs];
        for (int i = 0; i < builders.length; i++) {
            builders[i] = client().prepareIndex("test", "type").setSource("field", "value");
        }
        indexRandom(true, builders);
        ensureGreen();
        assertAllSuccessful(client().admin().indices().prepareFlush().setForce(true).setWaitIfOngoing(true).execute().actionGet());
        // we have to flush at least once here since we don't corrupt the translog
        CountResponse countResponse = client().prepareCount().get();
        assertHitCount(countResponse, numDocs);

        ShardRouting shardRouting = corruptRandomPrimaryFile(false);
        // we don't corrupt segments.gen since S/R doesn't snapshot this file
        // the other problem here why we can't corrupt segments.X files is that the snapshot flushes again before
        // it snapshots and that will write a new segments.X+1 file
        logger.info("-->  creating repository");
        assertAcked(client().admin().cluster().preparePutRepository("test-repo")
                .setType("fs").setSettings(ImmutableSettings.settingsBuilder()
                        .put("location", newTempDir(LifecycleScope.SUITE).getAbsolutePath())
                        .put("compress", randomBoolean())
                        .put("chunk_size", randomIntBetween(100, 1000))));
        logger.info("--> snapshot");
        CreateSnapshotResponse createSnapshotResponse = client().admin().cluster().prepareCreateSnapshot("test-repo", "test-snap").setWaitForCompletion(true).setIndices("test").get();
        assertThat(createSnapshotResponse.getSnapshotInfo().state(), equalTo(SnapshotState.PARTIAL));
        logger.info("failed during snapshot -- maybe SI file got corrupted");
        final List<File> files = listShardFiles(shardRouting);
        File corruptedFile = null;
        for (File file : files) {
            if (file.getName().startsWith("corrupted_")) {
                corruptedFile = file;
                break;
            }
        }
        assertThat(corruptedFile, notNullValue());
    }

    /**
     * This test verifies that if we corrupt a replica, we can still get to green, even though
     * listing its store fails. Note, we need to make sure that replicas are allocated on all data
     * nodes, so that replica won't be sneaky and allocated on a node that doesn't have a corrupted
     * replica.
     */
    @Test
