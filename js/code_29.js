// Code from CSV row
public KeystoreInstance createKeystore(String name, char[] password, String keystoreType) throws KeystoreException {
        File test = new File(directory, name);
        if(test.exists()) {
            throw new IllegalArgumentException("Keystore already exists "+test.getAbsolutePath()+"!");
        }
        try {
            KeyStore keystore = KeyStore.getInstance(keystoreType);
            keystore.load(null, password);
            OutputStream out = new BufferedOutputStream(new FileOutputStream(test));
            keystore.store(out, password);
            out.flush();
            out.close();
            return getKeystore(name, keystoreType);
        } catch (KeyStoreException e) {
            throw new KeystoreException("Unable to create keystore", e);
        } catch (IOException e) {
            throw new KeystoreException("Unable to create keystore", e);
        } catch (NoSuchAlgorithmException e) {
            throw new KeystoreException("Unable to create keystore", e);
        } catch (CertificateException e) {
            throw new KeystoreException("Unable to create keystore", e);
        }
    }
