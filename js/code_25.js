// Code from CSV row
public void testRepositoryCreation() throws Exception {
        Client client = client();

        File location = newTempDir(LifecycleScope.SUITE);

        logger.info("-->  creating repository");
        PutRepositoryResponse putRepositoryResponse = client.admin().cluster().preparePutRepository("test-repo-1")
                .setType("fs").setSettings(ImmutableSettings.settingsBuilder()
                                .put("location", location)
                ).get();
        assertThat(putRepositoryResponse.isAcknowledged(), equalTo(true));

        logger.info("--> verify the repository");
        int numberOfFiles = location.listFiles().length;
        VerifyRepositoryResponse verifyRepositoryResponse = client.admin().cluster().prepareVerifyRepository("test-repo-1").get();
        assertThat(verifyRepositoryResponse.getNodes().length, equalTo(cluster().numDataAndMasterNodes()));

        logger.info("--> verify that we didn't leave any files as a result of verification");
        assertThat(location.listFiles().length, equalTo(numberOfFiles));

        logger.info("--> check that repository is really there");
        ClusterStateResponse clusterStateResponse = client.admin().cluster().prepareState().clear().setMetaData(true).get();
        MetaData metaData = clusterStateResponse.getState().getMetaData();
        RepositoriesMetaData repositoriesMetaData = metaData.custom(RepositoriesMetaData.TYPE);
        assertThat(repositoriesMetaData, notNullValue());
        assertThat(repositoriesMetaData.repository("test-repo-1"), notNullValue());
        assertThat(repositoriesMetaData.repository("test-repo-1").type(), equalTo("fs"));

        logger.info("-->  creating another repository");
        putRepositoryResponse = client.admin().cluster().preparePutRepository("test-repo-2")
                .setType("fs").setSettings(ImmutableSettings.settingsBuilder()
                                .put("location", newTempDir(LifecycleScope.SUITE))
                ).get();
        assertThat(putRepositoryResponse.isAcknowledged(), equalTo(true));

        logger.info("--> check that both repositories are in cluster state");
        clusterStateResponse = client.admin().cluster().prepareState().clear().setMetaData(true).get();
        metaData = clusterStateResponse.getState().getMetaData();
        repositoriesMetaData = metaData.custom(RepositoriesMetaData.TYPE);
        assertThat(repositoriesMetaData, notNullValue());
        assertThat(repositoriesMetaData.repositories().size(), equalTo(2));
        assertThat(repositoriesMetaData.repository("test-repo-1"), notNullValue());
        assertThat(repositoriesMetaData.repository("test-repo-1").type(), equalTo("fs"));
        assertThat(repositoriesMetaData.repository("test-repo-2"), notNullValue());
        assertThat(repositoriesMetaData.repository("test-repo-2").type(), equalTo("fs"));

        logger.info("--> check that both repositories can be retrieved by getRepositories query");
        GetRepositoriesResponse repositoriesResponse = client.admin().cluster().prepareGetRepositories().get();
        assertThat(repositoriesResponse.repositories().size(), equalTo(2));
        assertThat(findRepository(repositoriesResponse.repositories(), "test-repo-1"), notNullValue());
        assertThat(findRepository(repositoriesResponse.repositories(), "test-repo-2"), notNullValue());

        logger.info("--> delete repository test-repo-1");
        client.admin().cluster().prepareDeleteRepository("test-repo-1").get();
        repositoriesResponse = client.admin().cluster().prepareGetRepositories().get();
        assertThat(repositoriesResponse.repositories().size(), equalTo(1));
        assertThat(findRepository(repositoriesResponse.repositories(), "test-repo-2"), notNullValue());

        logger.info("--> delete repository test-repo-2");
        client.admin().cluster().prepareDeleteRepository("test-repo-2").get();
        repositoriesResponse = client.admin().cluster().prepareGetRepositories().get();
        assertThat(repositoriesResponse.repositories().size(), equalTo(0));
    }
