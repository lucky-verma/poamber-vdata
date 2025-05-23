// Code from CSV row
public static Document signMetaInfo(Crypto crypto, String keyAlias, String keyPassword,
                                              InputStream metaInfo, String referenceID) throws Exception {
        if (keyAlias == null || "".equals(keyAlias)) {
            keyAlias = crypto.getDefaultX509Identifier();
        }
        X509Certificate cert = CertsUtils.getX509Certificate(crypto, keyAlias);
//    }
    
/*    public static ByteArrayOutputStream signMetaInfo(FederationContext config, InputStream metaInfo,
        String referenceID)
        throws Exception {

        KeyManager keyManager = config.getSigningKey();
        String keyAlias = keyManager.getKeyAlias();
        String keypass  = keyManager.getKeyPassword();
        
        // in case we did not specify the key alias, we assume there is only one key in the keystore ,
        // we use this key's alias as default. 
        if (keyAlias == null || "".equals(keyAlias)) {
            //keyAlias = getDefaultX509Identifier(ks);
            keyAlias = keyManager.getCrypto().getDefaultX509Identifier();
        }
        CryptoType cryptoType = new CryptoType(CryptoType.TYPE.ALIAS);
        cryptoType.setAlias(keyAlias);
        X509Certificate[] issuerCerts = keyManager.getCrypto().getX509Certificates(cryptoType);
        if (issuerCerts == null || issuerCerts.length == 0) {
            throw new ProcessingException(
                    "No issuer certs were found to sign the metadata using issuer name: "
                            + keyAlias);
        }
        X509Certificate cert = issuerCerts[0];
*/        
        String signatureMethod = null;
        if ("SHA1withDSA".equals(cert.getSigAlgName())) {
            signatureMethod = SignatureMethod.DSA_SHA1;
        } else if ("SHA1withRSA".equals(cert.getSigAlgName())) {
            signatureMethod = SignatureMethod.RSA_SHA1;
        } else if ("SHA256withRSA".equals(cert.getSigAlgName())) {
            signatureMethod = SignatureMethod.RSA_SHA1;
        } else {
            LOG.error("Unsupported signature method: " + cert.getSigAlgName());
            throw new RuntimeException("Unsupported signature method: " + cert.getSigAlgName());
        }
        
        List<Transform> transformList = new ArrayList<Transform>();
        transformList.add(XML_SIGNATURE_FACTORY.newTransform(Transform.ENVELOPED, (TransformParameterSpec)null));
        transformList.add(XML_SIGNATURE_FACTORY.newCanonicalizationMethod(CanonicalizationMethod.EXCLUSIVE,
                                                             (C14NMethodParameterSpec)null));
        
        // Create a Reference to the enveloped document (in this case,
        // you are signing the whole document, so a URI of "" signifies
        // that, and also specify the SHA1 digest algorithm and
        // the ENVELOPED Transform.
        Reference ref = XML_SIGNATURE_FACTORY.newReference(
            "#" + referenceID,
            XML_SIGNATURE_FACTORY.newDigestMethod(DigestMethod.SHA1, null),
            transformList,
            null, null);

        // Create the SignedInfo.
        SignedInfo si = XML_SIGNATURE_FACTORY.newSignedInfo(
            XML_SIGNATURE_FACTORY.newCanonicalizationMethod(
                CanonicalizationMethod.EXCLUSIVE, (C14NMethodParameterSpec)null),
            XML_SIGNATURE_FACTORY.newSignatureMethod(
                signatureMethod, null), Collections.singletonList(ref));

        // step 2
        // Load the KeyStore and get the signing key and certificate.
        
        PrivateKey keyEntry = crypto.getPrivateKey(keyAlias, keyPassword);
        
        // Create the KeyInfo containing the X509Data.
        KeyInfoFactory kif = XML_SIGNATURE_FACTORY.getKeyInfoFactory();
        List<Object> x509Content = new ArrayList<Object>();
        x509Content.add(cert.getSubjectX500Principal().getName());
        x509Content.add(cert);
        X509Data xd = kif.newX509Data(x509Content);
        KeyInfo ki = kif.newKeyInfo(Collections.singletonList(xd));

        // step3
        // Instantiate the document to be signed.
        Document doc = DOC_BUILDER_FACTORY.newDocumentBuilder().parse(metaInfo);

        // Create a DOMSignContext and specify the RSA PrivateKey and
        // location of the resulting XMLSignature's parent element.
        //DOMSignContext dsc = new DOMSignContext(keyEntry.getPrivateKey(), doc.getDocumentElement());
        DOMSignContext dsc = new DOMSignContext(keyEntry, doc.getDocumentElement());
        dsc.setIdAttributeNS(doc.getDocumentElement(), null, "ID");
        dsc.setNextSibling(doc.getDocumentElement().getFirstChild());

        // Create the XMLSignature, but don't sign it yet.
        XMLSignature signature = XML_SIGNATURE_FACTORY.newXMLSignature(si, ki);

        // Marshal, generate, and sign the enveloped signature.
        signature.sign(dsc);

        // step 4
        // Output the resulting document.
        
        return doc;
    }
