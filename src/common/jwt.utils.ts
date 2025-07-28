export enum SupportedJwtAlgorithms {
  RS256 = 'RS256',
  HS256 = 'HS256',
}

export type SupportedJwtAlgorithmType = keyof typeof SupportedJwtAlgorithms;
