export interface Config {
  httpListeningPort: number;
  webserverHomeDirectory: string;
  servers: {
    trueName: string;
    aliases: string[];
    botToken: string;
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
  }[];
}
export declare function getConfig(updatedConfigCallback: (config: Config) => void): Promise<Config>;
