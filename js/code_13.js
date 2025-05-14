// Code from CSV row
public X509Certificate generateCert(PublicKey publicKey,
                                        PrivateKey privateKey, String sigalg, int validity, String cn,
                                        String ou, String o, String l, String st, String c)
            throws java.security.SignatureException,
            java.security.InvalidKeyException {
        X509V1CertificateGenerator certgen = new X509V1CertificateGenerator();

        // issuer dn
        Vector order = new Vector();
        Hashtable attrmap = new Hashtable();

        if (cn != null) {
            attrmap.put(X509Principal.CN, cn);
            order.add(X509Principal.CN);
        }

        if (ou != null) {
            attrmap.put(X509Principal.OU, ou);
            order.add(X509Principal.OU);
        }

        if (o != null) {
            attrmap.put(X509Principal.O, o);
            order.add(X509Principal.O);
        }

        if (l != null) {
            attrmap.put(X509Principal.L, l);
            order.add(X509Principal.L);
        }

        if (st != null) {
            attrmap.put(X509Principal.ST, st);
            order.add(X509Principal.ST);
        }

        if (c != null) {
            attrmap.put(X509Principal.C, c);
            order.add(X509Principal.C);
        }

        X509Principal issuerDN = new X509Principal(order, attrmap);
        certgen.setIssuerDN(issuerDN);

        // validity
        long curr = System.currentTimeMillis();
        long untill = curr + (long) validity * 24 * 60 * 60 * 1000;

        certgen.setNotBefore(new Date(curr));
        certgen.setNotAfter(new Date(untill));

        // subject dn
        certgen.setSubjectDN(issuerDN);

        // public key
        certgen.setPublicKey(publicKey);

        // signature alg
        certgen.setSignatureAlgorithm(sigalg);

        // serial number
        certgen.setSerialNumber(new BigInteger(String.valueOf(curr)));

        // make certificate
        return certgen.generateX509Certificate(privateKey);
    }
