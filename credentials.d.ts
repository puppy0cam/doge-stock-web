export interface Config {
  httpListeningPort: number;
  httpsListeningPort: number;
  /** Changing this value requires app to be rebooted */
  httpsCertificateFilePath: string;
  /** Changing this value requires app to be rebooted */
  httpsPrivateKeyFilePath: string;
  webserverHomeDirectory: string;
  servers: {
      trueName: string;
      aliases: string[];
      database: {
          client: 'mysql';
          connection: {
              host: string;
              database: string;
              multipleStatements: boolean;
              password: string;
              user: string;
              supporBigNumbers: boolean;
              charset: string;
          };
      };
      publicExchanges: string[];
      amqp: {
          hostname: string;
          password: string;
          username: string;
          vhost: string;
      };
  }[];
}
export declare function getConfig(updatedConfigCallback: (config: Config) => void): Promise<Config>;
