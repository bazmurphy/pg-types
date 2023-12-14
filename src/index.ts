import "dotenv/config";
import { Pool } from "pg";

// you do not need to use any explicit Typing
// the library and the types exist already
// hover your mouse over Pool
// hover your mouse over connectionString
// you can see they are Typed
// try to add a new key/value with intellisense (ctrl(command) + space)
const database = new Pool({
  connectionString: process.env.DATABASE_CONNECTION_STRING,
  ssl: false,
  // ssl: { rejectUnauthorized: false },
});

const connectToDatabase = async () => {
  try {
    await database.connect();
    console.log("database connected...");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log("creating users table...");
    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        CONSTRAINT unique_username UNIQUE (username),
        CONSTRAINT unique_email UNIQUE (email)
      );
    `);

    console.log("inserting users...");
    await database.query(`
      INSERT INTO users (username, email) VALUES 
      ('user1', 'user1@example.com'),
      ('user2', 'user2@example.com')
      ON CONFLICT (username) DO UPDATE SET
        email = EXCLUDED.email;
    `);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const queryDatabase = async () => {
  try {
    console.log("querying database...");
    const result = await database.query("SELECT * FROM users");
    console.log("query result:", result.rows);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const clearTable = async () => {
  try {
    console.log("clearing users table...");
    await database.query("DELETE FROM users");
    console.log("users table cleared");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const disconnectFromDatabase = async () => {
  try {
    console.log("disconnecting from database...");
    await database.end();
    console.log("disconnected from the database");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectToDatabase();
    await seedDatabase();
    await queryDatabase();
    await clearTable();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
    process.exit(0);
  }
};

main();

// ------------ NOTES -----------------

// look in node_modules\@types\pg\index.d.ts
// at this Type "ClientConfig":

// export interface ClientConfig {
//   user?: string | undefined;
//   database?: string | undefined;
//   password?: string | (() => string | Promise<string>) | undefined;
//   port?: number | undefined;
//   host?: string | undefined;
//   connectionString?: string | undefined;
//   keepAlive?: boolean | undefined;
//   stream?: () => stream.Duplex | stream.Duplex | undefined;
//   statement_timeout?: false | number | undefined;
//   ssl?: boolean | ConnectionOptions | undefined;
//   query_timeout?: number | undefined;
//   keepAliveInitialDelayMillis?: number | undefined;
//   idle_in_transaction_session_timeout?: number | undefined;
//   application_name?: string | undefined;
//   connectionTimeoutMillis?: number | undefined;
//   types?: CustomTypesConfig | undefined;
//   options?: string | undefined;
// }

// ------------------------------------

// look in node_modules\@types\node\tls.d.ts
// at this Type "ConnectionOptions"

// interface ConnectionOptions
//   extends SecureContextOptions,
//     CommonConnectionOptions {
//   host?: string | undefined;
//   port?: number | undefined;
//   path?: string | undefined; // Creates unix socket connection to path. If this option is specified, `host` and `port` are ignored.
//   socket?: stream.Duplex | undefined; // Establish secure connection on a given socket rather than creating a new socket
//   checkServerIdentity?: typeof checkServerIdentity | undefined;
//   servername?: string | undefined; // SNI TLS Extension
//   session?: Buffer | undefined;
//   minDHSize?: number | undefined;
//   lookup?: net.LookupFunction | undefined;
//   timeout?: number | undefined;
//   /**
//    * When negotiating TLS-PSK (pre-shared keys), this function is called
//    * with optional identity `hint` provided by the server or `null`
//    * in case of TLS 1.3 where `hint` was removed.
//    * It will be necessary to provide a custom `tls.checkServerIdentity()`
//    * for the connection as the default one will try to check hostname/IP
//    * of the server against the certificate but that's not applicable for PSK
//    * because there won't be a certificate present.
//    * More information can be found in the RFC 4279.
//    *
//    * @param hint message sent from the server to help client
//    * decide which identity to use during negotiation.
//    * Always `null` if TLS 1.3 is used.
//    * @returns Return `null` to stop the negotiation process. `psk` must be
//    * compatible with the selected cipher's digest.
//    * `identity` must use UTF-8 encoding.
//    */
//   pskCallback?(hint: string | null): PSKCallbackNegotation | null;
// }

// ------------------------------------

// look in node_modules\@types\node\tls.d.ts
// at this Type "SecureContextOptions"

// interface SecureContextOptions {
//   /**
//    * If set, this will be called when a client opens a connection using the ALPN extension.
//    * One argument will be passed to the callback: an object containing `servername` and `protocols` fields,
//    * respectively containing the server name from the SNI extension (if any) and an array of
//    * ALPN protocol name strings. The callback must return either one of the strings listed in `protocols`,
//    * which will be returned to the client as the selected ALPN protocol, or `undefined`,
//    * to reject the connection with a fatal alert. If a string is returned that does not match one of
//    * the client's ALPN protocols, an error will be thrown.
//    * This option cannot be used with the `ALPNProtocols` option, and setting both options will throw an error.
//    */
//   ALPNCallback?:
//     | ((arg: { servername: string; protocols: string[] }) => string | undefined)
//     | undefined;
//   /**
//    * Optionally override the trusted CA certificates. Default is to trust
//    * the well-known CAs curated by Mozilla. Mozilla's CAs are completely
//    * replaced when CAs are explicitly specified using this option.
//    */
//   ca?: string | Buffer | Array<string | Buffer> | undefined;
//   /**
//    *  Cert chains in PEM format. One cert chain should be provided per
//    *  private key. Each cert chain should consist of the PEM formatted
//    *  certificate for a provided private key, followed by the PEM
//    *  formatted intermediate certificates (if any), in order, and not
//    *  including the root CA (the root CA must be pre-known to the peer,
//    *  see ca). When providing multiple cert chains, they do not have to
//    *  be in the same order as their private keys in key. If the
//    *  intermediate certificates are not provided, the peer will not be
//    *  able to validate the certificate, and the handshake will fail.
//    */
//   cert?: string | Buffer | Array<string | Buffer> | undefined;
//   /**
//    *  Colon-separated list of supported signature algorithms. The list
//    *  can contain digest algorithms (SHA256, MD5 etc.), public key
//    *  algorithms (RSA-PSS, ECDSA etc.), combination of both (e.g
//    *  'RSA+SHA384') or TLS v1.3 scheme names (e.g. rsa_pss_pss_sha512).
//    */
//   sigalgs?: string | undefined;
//   /**
//    * Cipher suite specification, replacing the default. For more
//    * information, see modifying the default cipher suite. Permitted
//    * ciphers can be obtained via tls.getCiphers(). Cipher names must be
//    * uppercased in order for OpenSSL to accept them.
//    */
//   ciphers?: string | undefined;
//   /**
//    * Name of an OpenSSL engine which can provide the client certificate.
//    */
//   clientCertEngine?: string | undefined;
//   /**
//    * PEM formatted CRLs (Certificate Revocation Lists).
//    */
//   crl?: string | Buffer | Array<string | Buffer> | undefined;
//   /**
//    * `'auto'` or custom Diffie-Hellman parameters, required for non-ECDHE perfect forward secrecy.
//    * If omitted or invalid, the parameters are silently discarded and DHE ciphers will not be available.
//    * ECDHE-based perfect forward secrecy will still be available.
//    */
//   dhparam?: string | Buffer | undefined;
//   /**
//    * A string describing a named curve or a colon separated list of curve
//    * NIDs or names, for example P-521:P-384:P-256, to use for ECDH key
//    * agreement. Set to auto to select the curve automatically. Use
//    * crypto.getCurves() to obtain a list of available curve names. On
//    * recent releases, openssl ecparam -list_curves will also display the
//    * name and description of each available elliptic curve. Default:
//    * tls.DEFAULT_ECDH_CURVE.
//    */
//   ecdhCurve?: string | undefined;
//   /**
//    * Attempt to use the server's cipher suite preferences instead of the
//    * client's. When true, causes SSL_OP_CIPHER_SERVER_PREFERENCE to be
//    * set in secureOptions
//    */
//   honorCipherOrder?: boolean | undefined;
//   /**
//    * Private keys in PEM format. PEM allows the option of private keys
//    * being encrypted. Encrypted keys will be decrypted with
//    * options.passphrase. Multiple keys using different algorithms can be
//    * provided either as an array of unencrypted key strings or buffers,
//    * or an array of objects in the form {pem: <string|buffer>[,
//    * passphrase: <string>]}. The object form can only occur in an array.
//    * object.passphrase is optional. Encrypted keys will be decrypted with
//    * object.passphrase if provided, or options.passphrase if it is not.
//    */
//   key?: string | Buffer | Array<string | Buffer | KeyObject> | undefined;
//   /**
//    * Name of an OpenSSL engine to get private key from. Should be used
//    * together with privateKeyIdentifier.
//    */
//   privateKeyEngine?: string | undefined;
//   /**
//    * Identifier of a private key managed by an OpenSSL engine. Should be
//    * used together with privateKeyEngine. Should not be set together with
//    * key, because both options define a private key in different ways.
//    */
//   privateKeyIdentifier?: string | undefined;
//   /**
//    * Optionally set the maximum TLS version to allow. One
//    * of `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`. Cannot be specified along with the
//    * `secureProtocol` option, use one or the other.
//    * **Default:** `'TLSv1.3'`, unless changed using CLI options. Using
//    * `--tls-max-v1.2` sets the default to `'TLSv1.2'`. Using `--tls-max-v1.3` sets the default to
//    * `'TLSv1.3'`. If multiple of the options are provided, the highest maximum is used.
//    */
//   maxVersion?: SecureVersion | undefined;
//   /**
//    * Optionally set the minimum TLS version to allow. One
//    * of `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`. Cannot be specified along with the
//    * `secureProtocol` option, use one or the other.  It is not recommended to use
//    * less than TLSv1.2, but it may be required for interoperability.
//    * **Default:** `'TLSv1.2'`, unless changed using CLI options. Using
//    * `--tls-v1.0` sets the default to `'TLSv1'`. Using `--tls-v1.1` sets the default to
//    * `'TLSv1.1'`. Using `--tls-min-v1.3` sets the default to
//    * 'TLSv1.3'. If multiple of the options are provided, the lowest minimum is used.
//    */
//   minVersion?: SecureVersion | undefined;
//   /**
//    * Shared passphrase used for a single private key and/or a PFX.
//    */
//   passphrase?: string | undefined;
//   /**
//    * PFX or PKCS12 encoded private key and certificate chain. pfx is an
//    * alternative to providing key and cert individually. PFX is usually
//    * encrypted, if it is, passphrase will be used to decrypt it. Multiple
//    * PFX can be provided either as an array of unencrypted PFX buffers,
//    * or an array of objects in the form {buf: <string|buffer>[,
//    * passphrase: <string>]}. The object form can only occur in an array.
//    * object.passphrase is optional. Encrypted PFX will be decrypted with
//    * object.passphrase if provided, or options.passphrase if it is not.
//    */
//   pfx?: string | Buffer | Array<string | Buffer | PxfObject> | undefined;
//   /**
//    * Optionally affect the OpenSSL protocol behavior, which is not
//    * usually necessary. This should be used carefully if at all! Value is
//    * a numeric bitmask of the SSL_OP_* options from OpenSSL Options
//    */
//   secureOptions?: number | undefined; // Value is a numeric bitmask of the `SSL_OP_*` options
//   /**
//    * Legacy mechanism to select the TLS protocol version to use, it does
//    * not support independent control of the minimum and maximum version,
//    * and does not support limiting the protocol to TLSv1.3. Use
//    * minVersion and maxVersion instead. The possible values are listed as
//    * SSL_METHODS, use the function names as strings. For example, use
//    * 'TLSv1_1_method' to force TLS version 1.1, or 'TLS_method' to allow
//    * any TLS protocol version up to TLSv1.3. It is not recommended to use
//    * TLS versions less than 1.2, but it may be required for
//    * interoperability. Default: none, see minVersion.
//    */
//   secureProtocol?: string | undefined;
//   /**
//    * Opaque identifier used by servers to ensure session state is not
//    * shared between applications. Unused by clients.
//    */
//   sessionIdContext?: string | undefined;
//   /**
//    * 48-bytes of cryptographically strong pseudo-random data.
//    * See Session Resumption for more information.
//    */
//   ticketKeys?: Buffer | undefined;
//   /**
//    * The number of seconds after which a TLS session created by the
//    * server will no longer be resumable. See Session Resumption for more
//    * information. Default: 300.
//    */
//   sessionTimeout?: number | undefined;
// }

// ------------------------------------

// look in node_modules\@types\node\tls.d.ts
// and this Type "CommonConnectionOptions"

// interface CommonConnectionOptions {
//   /**
//    * An optional TLS context object from tls.createSecureContext()
//    */
//   secureContext?: SecureContext | undefined;
//   /**
//    * When enabled, TLS packet trace information is written to `stderr`. This can be
//    * used to debug TLS connection problems.
//    * @default false
//    */
//   enableTrace?: boolean | undefined;
//   /**
//    * If true the server will request a certificate from clients that
//    * connect and attempt to verify that certificate. Defaults to
//    * false.
//    */
//   requestCert?: boolean | undefined;
//   /**
//    * An array of strings or a Buffer naming possible ALPN protocols.
//    * (Protocols should be ordered by their priority.)
//    */
//   ALPNProtocols?: string[] | Uint8Array[] | Uint8Array | undefined;
//   /**
//    * SNICallback(servername, cb) <Function> A function that will be
//    * called if the client supports SNI TLS extension. Two arguments
//    * will be passed when called: servername and cb. SNICallback should
//    * invoke cb(null, ctx), where ctx is a SecureContext instance.
//    * (tls.createSecureContext(...) can be used to get a proper
//    * SecureContext.) If SNICallback wasn't provided the default callback
//    * with high-level API will be used (see below).
//    */
//   SNICallback?:
//     | ((
//         servername: string,
//         cb: (err: Error | null, ctx?: SecureContext) => void
//       ) => void)
//     | undefined;
//   /**
//    * If true the server will reject any connection which is not
//    * authorized with the list of supplied CAs. This option only has an
//    * effect if requestCert is true.
//    * @default true
//    */
//   rejectUnauthorized?: boolean | undefined;
// }

// ------------------------------------
